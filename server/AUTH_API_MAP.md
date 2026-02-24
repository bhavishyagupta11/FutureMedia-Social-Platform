# Auth + Database Mapping

## User collection (`users`)

Fields written on signup and used by login:

- `_id`: MongoDB ObjectId (primary key)
- `firstName`: string
- `lastName`: string
- `username`: string, unique, stored lowercase
- `password`: string, stored as `scrypt$sha512$<salt>$<hash>`
- `img`: string profile image URL/path (default `""`)
- `followings`: number
- `followers`: number
- `followersList`: string[]
- `createdAt` / `updatedAt`: timestamps

## Signup route

- Endpoint: `POST /api/user/signup`
- Request body:
  - `firstName`, `lastName`, `username`, `password`
- Validation:
  - all required
  - `username.length >= 3`
  - `password.length >= 6`
- Behavior:
  - normalizes username to lowercase
  - checks unique username
  - hashes password before storing
- Response:
  - `201` with `{ message, data }`, where `data` is safe public user object (no password)

## Login route

- Endpoint: `POST /api/user/login`
- Request body:
  - `username`, `password`
- Validation:
  - both required
- Behavior:
  - normalizes username to lowercase
  - verifies scrypt password hash
  - supports legacy plain-text passwords and upgrades them to hash after successful login
- Response:
  - `200` with `{ message, data }` (safe public user object)

## Public user payload shape (`data`)

```json
{
  "_id": "65f...",
  "firstName": "Sam",
  "lastName": "Lee",
  "username": "samlee",
  "img": "",
  "followings": 0,
  "followers": 0,
  "followersList": [],
  "createdAt": "2026-02-10T12:00:00.000Z",
  "updatedAt": "2026-02-10T12:00:00.000Z"
}
```

This payload is returned by:

- `POST /api/user/login`
- `POST /api/user/signup`
- `GET /api/user/all`
- `GET /api/user/fetchUsers`
