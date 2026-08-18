import { FastifyInstance } from 'fastify';
import { eq } from 'drizzle-orm';
import { db } from '../../db/index.js';
import { users, creatorProfiles } from '../../db/schema/index.js';
import { AppError } from '../../utils/errors.js';

interface ProfileBody {
  name?: string;
  avatarUrl?: string;
  displayName?: string;
  bio?: string;
}

export async function userRoutes(app: FastifyInstance) {
  // GET /api/users/me — current user + profile
  app.get('/me', async (request, reply) => {
    const userId = (request.headers['x-user-id'] as string) ?? '';
    if (!userId) return reply.status(401).send({ error: { message: 'Unauthorized', code: 'UNAUTHORIZED', statusCode: 401 } });

    try {
      const [user] = await db
        .select({
          id: users.id,
          email: users.email,
          name: users.name,
          avatarUrl: users.avatarUrl,
          role: users.role,
          createdAt: users.createdAt,
        })
        .from(users)
        .where(eq(users.id, userId));

      if (!user) {
        return reply.status(404).send({ error: { message: 'User not found', code: 'NOT_FOUND', statusCode: 404 } });
      }

      const [profile] = await db
        .select()
        .from(creatorProfiles)
        .where(eq(creatorProfiles.userId, userId));

      return { ...user, profile: profile ?? null };
    } catch (err) {
      throw new AppError('Failed to fetch user', 500, 'DB_ERROR');
    }
  });

  // PATCH /api/users/me — update user name / avatar / profile fields
  app.patch<{ Body: ProfileBody }>('/me', async (request, reply) => {
    const userId = (request.headers['x-user-id'] as string) ?? '';
    if (!userId) return reply.status(401).send({ error: { message: 'Unauthorized', code: 'UNAUTHORIZED', statusCode: 401 } });

    const { name, avatarUrl, displayName, bio } = request.body ?? {};

    try {
      const [existing] = await db.select().from(users).where(eq(users.id, userId));
      if (!existing) {
        return reply.status(404).send({ error: { message: 'User not found', code: 'NOT_FOUND', statusCode: 404 } });
      }

      // Update core user fields
      const userUpdates: Record<string, unknown> = { updatedAt: new Date() };
      if (name) userUpdates.name = name;
      if (avatarUrl) userUpdates.avatarUrl = avatarUrl;

      const [updatedUser] = await db
        .update(users)
        .set(userUpdates)
        .where(eq(users.id, userId))
        .returning();

      // Upsert creator profile fields
      let updatedProfile = null;
      if (displayName || bio) {
        const [existingProfile] = await db
          .select()
          .from(creatorProfiles)
          .where(eq(creatorProfiles.userId, userId));

        if (existingProfile) {
          const profileUpdates: Record<string, unknown> = { updatedAt: new Date() };
          if (displayName) profileUpdates.displayName = displayName;
          if (bio) profileUpdates.bio = bio;

          [updatedProfile] = await db
            .update(creatorProfiles)
            .set(profileUpdates)
            .where(eq(creatorProfiles.userId, userId))
            .returning();
        } else {
          [updatedProfile] = await db
            .insert(creatorProfiles)
            .values({
              userId,
              displayName: displayName ?? updatedUser.name,
              bio: bio ?? null,
            })
            .returning();
        }
      }

      return { ...updatedUser, profile: updatedProfile };
    } catch (err) {
      throw new AppError('Failed to update user', 500, 'DB_ERROR');
    }
  });
}

export default userRoutes;