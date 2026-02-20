import User from "../models/user.model.js";
import { generateToken } from "../lib/utils.js";
import cloudinary from "../lib/cloudinary.js";

export async function signup(req, res) {
  const { email, password, name, termsAccepted } = req.body;

  try {
    if (!email || !password || !name) {
      return res.status(400).json({ message: "All Fields are Required" });
    }

    // Terms check (Optional but robust)
    if (termsAccepted === false) {
      return res.status(400).json({ message: "You must accept the Terms & Conditions" });
    }

    // Password validation: minimum 10 chars with required complexity
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{10,}$/;
    if (!passwordRegex.test(password)) {
      return res.status(400).json({
        message:
          "Password must be at least 10 characters and include uppercase, lowercase, number, and special character",
      });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: "Invalid email format" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res
        .status(400)
        .json({ message: "Email already exists, Please use different Email" });
    }

    const index = Math.floor(Math.random() * 100) + 1;
    const randomAvatar = `https://avatar.iran.liara.run/public/${index}.png`;

    const newUser = await User.create({
      email,
      name,
      password,
      profilePic: randomAvatar,
      termsAccepted: termsAccepted || false,
      termsAcceptedAt: termsAccepted ? new Date() : null
    });

    if (newUser) {
      const token = generateToken(newUser._id, res);
      res.status(201).json({
        success: true,
        user: {
          ...newUser.toObject(),
          password: "", // Security: ensure password isn't leaked
          isOnboarded: false // New users are never onboarded
        },
        token
      });
    } else {
      res.status(400).json({ message: "Invalid user data" });
    }
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error" });
  }
}

export async function login(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "All Fields are required" });
    }

    // Case-insensitive email lookup to handle "Doki@gmail.com" vs "doki@gmail.com"
    const user = await User.findOne({ email: { $regex: `^${email.trim()}$`, $options: "i" } });

    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const isPasswordCorrect = await user.matchPassword(password);

    if (!isPasswordCorrect) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    if (user) {
      const token = generateToken(user._id, res);

      // Return token in response for frontend usage (Bearer header)
      // Also return isOnboarded explicitly for frontend redirect logic
      res.status(200).json({
        success: true,
        user: {
          ...user.toObject(),
          isOnboarded: user.isOnboarded // Ensure this is present
        },
        token: token
      });
      return;
    }

  } catch (error) {
    res.status(500).json({ message: "Internal Server Error" });
  }
}

export function logout(req, res) {
  res.clearCookie("jwt");
  res.status(200).json({ success: true, message: "Logout Successfully" });
}

// export async function onboard(req, res) {
//   try {
//     const userId = req.user._id;

//     const { fullName, bio, location, profilePic } = req.body;

//     if (!fullName || !bio || !location) {
//       return res.status(400).json({
//         message: "All fields are required",
//         missingFields: [
//           !fullName && "fullName",
//           !bio && "bio",
//           !location && "location",
//         ].filter(Boolean),
//       });
//     }

//     let profilePicUrl = null;

//     if (profilePic) {
//       // Upload only if provided
//       const uploadResponse = await cloudinary.uploader.upload(profilePic);
//       profilePicUrl = uploadResponse.secure_url;
//     }

//     const updatedUser = await User.findByIdAndUpdate(
//       userId,
//       {
//         fullName,
//         bio,
//         location,
//         profilePic: profilePicUrl,

//         isOnboarded: true,
//       },
//       { new: true }
//     );

//     if (!updatedUser)
//       return res.status(404).json({ message: "User not found" });

//     res.status(200).json({ success: true, user: updatedUser });
//   } catch (error) {
//     console.log("Onboarding error: ", error);
//     res.status(500).json({ message: "Internal Server Error" });
//   }
// }

export const checkAuth = (req, res) => {
  try {
    res.status(200).json({ success: true, user: req.user });
  } catch (error) {
    console.log("Error in checkAuth Controller", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// export const signup = async (req, res) => {
//   console.log("Signup route hit");
//   res.json({ message: "Signup working" });
// };
