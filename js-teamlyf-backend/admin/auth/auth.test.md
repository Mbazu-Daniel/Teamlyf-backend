
1.  **Register User Endpoint**:
    
    -   Test registering a new user successfully.
    -   Test registering a user that already exists.
    -   Test handling of missing email or password.
    -   Test handling of invalid email format.
    -   Test internal server error during user registration.
2.  **Register Admin User Endpoint**:
    
    -   Test registering a new admin user successfully.
    -   Test registering an admin user when the current user is not a superAdmin.
    -   Test registering an admin user that already exists.
    -   Test handling of missing email, password, or role.
    -   Test internal server error during admin user registration.
3.  **Forget Password Endpoint**:
    
    -   Test sending a password reset link successfully.
    -   Test sending a password reset link for a non-existent user.
    -   Test handling of missing email.
    -   Test internal server error during password reset link generation.
4.  **Reset Password Endpoint**:
    
    -   Test resetting the password successfully.
    -   Test resetting the password with an invalid or expired token.
    -   Test handling of missing reset token or password.
    -   Test internal server error during password reset.
5.  **Change Password Endpoint**:
    
    -   Test changing the password successfully.
    -   Test changing the password with incorrect old password.
    -   Test changing the password when the user is not found.
    -   Test handling of missing old password or new password.
    -   Test internal server error during password change.