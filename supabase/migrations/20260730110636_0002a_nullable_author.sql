/*
# Allow nullable author_id for seeded content

Demo content is inserted via the service role (no auth session), so
`author_id` cannot default to `auth.uid()`. Making the column nullable lets
seeded patterns/articles exist without an owner; the real admin can later
claim them. The RLS policies still enforce that only admins can write.
*/

ALTER TABLE patterns ALTER COLUMN author_id DROP NOT NULL;
ALTER TABLE articles ALTER COLUMN author_id DROP NOT NULL;
