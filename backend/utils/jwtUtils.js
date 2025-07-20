const jwt = require('jsonwebtoken');

// Generate access token
const generateAccessToken = (user) => {
  if (!process.env.JWT_ACCESS_SECRET) {
    throw new Error('JWT_ACCESS_SECRET is not defined');
  }
  
  return jwt.sign(
    { 
      userId: user._id,
      role: user.role,
      iat: Math.floor(Date.now() / 1000)
    },
    process.env.JWT_ACCESS_SECRET,
    { 
      expiresIn: '15m',
      issuer: 'todolist-app',
      audience: 'todolist-users'
    }
  );
};

// Generate refresh token
const generateRefreshToken = (user) => {
  if (!process.env.JWT_REFRESH_SECRET) {
    throw new Error('JWT_REFRESH_SECRET is not defined');
  }
  
  return jwt.sign(
    { 
      userId: user._id,
      tokenVersion: user.tokenVersion || 0,
      iat: Math.floor(Date.now() / 1000)
    },
    process.env.JWT_REFRESH_SECRET,
    { 
      expiresIn: '7d',
      issuer: 'todolist-app',
      audience: 'todolist-users'
    }
  );
};

// Verify access token
const verifyAccessToken = (token) => {
  try {
    if (!process.env.JWT_ACCESS_SECRET) {
      throw new Error('JWT_ACCESS_SECRET is not defined');
    }
    
    return jwt.verify(token, process.env.JWT_ACCESS_SECRET, {
      issuer: 'todolist-app',
      audience: 'todolist-users'
    });
  } catch (error) {
    console.error('Access token verification failed:', error.message);
    return null;
  }
};

// Verify refresh token
const verifyRefreshToken = (token) => {
  try {
    if (!process.env.JWT_REFRESH_SECRET) {
      throw new Error('JWT_REFRESH_SECRET is not defined');
    }
    
    return jwt.verify(token, process.env.JWT_REFRESH_SECRET, {
      issuer: 'todolist-app',
      audience: 'todolist-users'
    });
  } catch (error) {
    console.error('Refresh token verification failed:', error.message);
    return null;
  }
};

// Set tokens in cookies
const setTokenCookies = (res, accessToken, refreshToken) => {
  // Set access token in httpOnly cookie
  res.cookie('accessToken', accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 15 * 60 * 1000, // 15 minutes
    path: '/'
  });

  // Set refresh token in httpOnly cookie
  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    path: '/'
  });
};

// Clear tokens from cookies
const clearTokenCookies = (res) => {
  res.clearCookie('accessToken', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/'
  });
  res.clearCookie('refreshToken', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/'
  });
};

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  setTokenCookies,
  clearTokenCookies,
  verifyAccessToken,
  verifyRefreshToken
}; 