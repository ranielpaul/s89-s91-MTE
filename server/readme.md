## Test Credentials:

### Admin Account:
- **Email:** `admin@mail.com`
- **Username:** `admin`
- **Password:** `AdminPassword123!`

## User Routes:
1. **Register User**: `POST /users/register`
2. **Login User**: `POST /users/login`

## Blog Routes

1. **Get All Posts**: `GET /`
2. **Get Post**: `GET /:id`

### Authenticated Users

3. **Create Blog**: `POST /add`
4. **Add Comment**: `PATCH /:id`
5. **Update Blog**: `PATCH /edit/:id`
6. **Delete Blog**: `DELETE /delete/:id`