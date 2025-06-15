// app/api/auth/register/route.ts

import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { connectDB } from '@/lib/mongodb';
import User from '@/models/User';
import { cookies } from 'next/headers';

export async function POST(req: Request) {
  try {
    // Connect to MongoDB
    await connectDB();

    // Parse JSON body
    const body = await req.json();
    console.log('Register body:', body);

    // Destructure fields from request body
    const { username, email, password, fullName, phone, age, gender, address } = body;

    // Validate required fields
    if (
      !fullName || typeof fullName !== 'string' || fullName.trim() === '' ||
      !email || typeof email !== 'string' || email.trim() === '' ||
      !password || typeof password !== 'string' || password.trim() === ''
    ) {
      return NextResponse.json(
        { message: 'Full name, email, and password are required and cannot be empty' },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json({ message: 'User already exists' }, { status: 400 });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user instance
    const newUser = new User({
      username,
      email,
      password: hashedPassword,
      name: fullName,           // Store fullName as 'name' in DB
      phone,
      age: age ? Number(age) : undefined,
      gender,
      address,
    });

    // Save user to database
    await newUser.save();

    // Create JWT token
    const token = jwt.sign(
      { userId: newUser._id },
      process.env.JWT_SECRET!,
      { expiresIn: '7d' }
    );

    // Set JWT as HTTP-only cookie
    cookies().set('token', token, {
      httpOnly: true,
      path: '/',
      // secure: true, // uncomment in production with HTTPS
      // sameSite: 'strict', // optional
    });

    // Return success response
    return NextResponse.json({ message: 'User registered successfully', token }, { status: 201 });

  } catch (error: any) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { message: 'Server error during registration', error: error.message || error.toString() },
      { status: 500 }
    );
  }
}
