# Email OTP Login API

## Endpoints

### 1. Send OTP
- **POST /api/auth/send-otp**
- Body: `{ "email": "user@example.com" }`
- Action: Sends a 6-digit OTP to the user's email (valid for 5 minutes).
- Response: `{ success: true }` or error

### 2. Login (Password or OTP)
- **POST /api/auth/login**
- Body: `{ "email": "user@example.com", "password": "..." }` OR `{ "email": "user@example.com", "otp": "123456" }`
- Action: Authenticates user by password or OTP. Issues JWT on success.
- Response: `{ token, user }` or error

## Usage Flow
1. User enters email, requests OTP.
2. User receives OTP via email, enters OTP to login.
3. Alternatively, user can login with password as before.

## Notes
- OTP is valid for 5 minutes.
- OTP is single-use.
- Password login is unchanged.

## Example Requests

### Send OTP
```
curl -X POST http://localhost:3001/api/auth/send-otp -H "Content-Type: application/json" -d '{"email":"user@example.com"}'
```

### Login with OTP
```
curl -X POST http://localhost:3001/api/auth/login -H "Content-Type: application/json" -d '{"email":"user@example.com", "otp":"123456"}'
```

### Login with Password
```
curl -X POST http://localhost:3001/api/auth/login -H "Content-Type: application/json" -d '{"email":"user@example.com", "password":"yourpassword"}'
```
