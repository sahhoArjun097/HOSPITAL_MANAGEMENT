import { catchAsyncError } from "../middlewares/catchAsyncErrors.js";
import ErrorHandler from "../middlewares/errorMiddleware.js";
import { User } from "../models/userSchema.js"
import { generateToken } from "../utils/jwtToken.js"
import cloudinary from "cloudinary"
export const patientRegister = catchAsyncError(async (req, res, next) => {
    const {
        firstName,
        lastName,
        email,
        phone,
        password,
        gender,
        dob,
        nic,
        role } = req.body;
    if (
        !firstName ||
        !lastName ||
        !email ||
        !phone ||
        !password ||
        !gender ||
        !dob ||
        !role) {
        return next(new ErrorHandler("please fill full form", 400));
    }
    let user = await User.findOne({ email });
    if (user) {
        return next(new ErrorHandler("User already register", 400));

    }
    user = await User.create({
        firstName,
        lastName,
        email,
        phone,
        password,
        gender,
        dob,
        nic,
        role

    });

    generateToken(user, "User register", 200, res)
    //    res.status(200).json({
    //     success:true,
    //     message:"User register"
    //    })

});
export const login = catchAsyncError(async (req, res, next) => {
    const {
        email, password, confirmPassword, role
    } = req.body;
    if (!email || !password || !confirmPassword || !role) {
        return next(new ErrorHandler("Please return all detailes", 400))
    }
    if (password !== confirmPassword) {
        return next(new ErrorHandler("password is incorrect", 400))

    }
    const user = await User.findOne({ email }).select("+password");
    if (!user) {
        return next(new ErrorHandler("invalide email or password", 400));
    }
    const isPasswordMatch = await user.comparePassword(password);
    if (!isPasswordMatch) {
        return next(new ErrorHandler("password is incorrect", 400))
    }
    if (role !== user.role) {
        return next(new ErrorHandler("User with this role not found", 400))

    }
    generateToken(user, "User login successfully", 200, res)
    // res.status(200).json({
    //     success:true,
    //     message:"User register successfully",
    //    })



});
export const addNewAdmin = catchAsyncError(async (req, res, next) => {
    const {
        firstName, lastName, email, phone, password, gender, dob, nic } = req.body;
    if (
        !firstName ||
        !lastName ||
        !email ||
        !phone ||
        !password ||
        !gender ||
        !dob
    ) {
        return next(new ErrorHandler("please fill full form", 400));
    }
    const isRegister = await User.findOne({ email });
    if (isRegister) {
        return next(new ErrorHandler("Admin with this email allready exist", 400));

    }
    const admin = await User.create({ firstName, lastName, email, phone, password, gender, dob, nic, role: "Admin" });
    res.status(200).json({
        success: true,
        message: "admin register"
    })

})

export const getAllDoc = catchAsyncError(async (req, res, next) => {
    const docs = await User.find({ role: "Docter" });
    res.status(200).json({
        success: true,
        docs,
    })
})
export const getAllDetails = catchAsyncError(async (req, res, next) => {
    const user = req.user;
    res.status(200).json({
        success: true.value,
        user,
    })
})

export const logoutAdmin = catchAsyncError(async (req, res, next) => {
    res.status(200).cookie("adminToken", " ", {
        htttpOnly: true,
        expires: new Date(Date.now())
    }).json({
        success: true,
        message: "Admin logout successfully"
    })
})

export const logoutPatient = catchAsyncError(async (req, res, next) => {
    res.status(200).cookie("patientToken", " ", {
        htttpOnly: true,
        expires: new Date(Date.now())
    }).json({
        success: true,
        message: "Patient  logout successfully"
    })
})


export const addNewDoc = catchAsyncError(async (req, res, next) => {
    if (!req.files || Object.keys(req.files).length === 0) {
        return next(new ErrorHandler("DOC NEW AVATAR REQUIRED", 400));
    }

    const { docAvatar } = req.files;
    const allowedFormats = ["image/png", "image/jpeg", "image/webp"];
    if (!allowedFormats.includes(docAvatar.mimetype)) { // Validate file format
        return next(new ErrorHandler("File format not supported", 400));
    }

    const {
        firstName,
        lastName,
        email,
        phone,
        password,
        gender,
        dob,
        nic,
        DocterDepatement,
    } = req.body;

    if (
        !firstName ||
        !lastName ||
        !email ||
        !phone ||
        !password ||
        !gender ||
        !dob ||
        !nic ||
        !DocterDepatement
    ) {
        return next(new ErrorHandler("Please fill all the details", 400));
    }

    const isRegistered = await User.findOne({ email });
    if (isRegistered) {
        return next(new ErrorHandler("User already registered with this email", 400));
    }

    // Upload file to Cloudinary
    const cloudinaryResponse = await cloudinary.uploader.upload(docAvatar.tempFilePath);

    if (!cloudinaryResponse || cloudinaryResponse.error) {
        console.log("Cloudinary error:", cloudinaryResponse.error || "Unknown Cloudinary error");
        return res.status(500).json({ success: false, message: "Failed to upload image" });
    }

    const doctor = await User.create({
        firstName,
        lastName,
        email,
        phone,
        password,
        gender,
        dob,
        nic,
        DocterDepatement,
        role: "Docter",
        docAvatar: {
            public_id: cloudinaryResponse.public_id,
            url: cloudinaryResponse.secure_url,
        },
    });
    

    res.status(200).json({
        success: true,
        message: "New doctor registered",
        doctor,
    });
});


// export const addNewDoc = catchAsyncError(async(req, res, next) => {
//     if (!req.files || Object.keys(req.files).length === 0) {
//         return next(new ErrorHandler("DOC NEW AVATAR REQUIRED", 400));
//     }
//     const { docAvatar } = req.files;
//     const allowedFormates = ["image/png", "image/jpeg", "image/wenp"];
//     if (!allowedFormates.includes(docAvatar.mimetype))// minmetype means match the extension
//     {
//         return next(new ErrorHandler("file formate not suppoeted", 400))
//     }
//     const {
//         firstName,
//         lastName,
//         email,
//         phone,
//         password,
//         gender,
//         dob,
//         nic,
//         DocterDepatement
//     } = req.body;
//     if (
//         !firstName ||
//         !lastName ||
//         !email ||
//         !phone ||
//         !password ||
//         !gender ||
//         !dob ||
//         !nic ||
//         !DocterDepatement

//     ) {
//         return next(new ErrorHandler("plese fill all the details", 400))
//     }
//     const isRegistered = await User.findOne({email});
//     if(isRegistered){
        
//         return next(new ErrorHandler(`${isRegistered} already register with this email`, 400))
//     }
//     const cloudinaryResponse = await cloudinary.uploader.upload(docAvatar.tempFilePath);

//     if (!cloudinaryResponse || cloudinaryResponse.error) {
//         console.log("Cloudinary error:", cloudinaryResponse.error || "Unknown Cloudinary error");
//         return res.status(500).json({ success: false, message: "Failed to upload image" });
//     }
    
//     const docter = await User.create({ firstName,
//         lastName,
//         email,
//         phone,
//         password,
//         gender,
//         dob,
//         nic,
//         DocterDepatement,
//         role : "Docter",
//         docAvatar:{
//             public_id:cloudinayResponse.public_id,
//             url :cloudinayResponse.secure_url,
//         }
//     })
//     res.status(200).json({
//         success:true,
//         message:"new doc register",
//         docter
//     })
// })
// export const addNewDoc = catchAsyncError(async (req, res, next) => {
//     console.log("req.files:", req.files);

//     if (!req.files || Object.keys(req.files).length === 0) {
//         return next(new ErrorHandler("DOC NEW AVATAR REQUIRED", 400)); 
//     }
//     const { docAvatar } = req.files;
//     const allowedFormats = ["image/png", "image/jpeg", "image/webp"];
//     if (!allowedFormats.includes(docAvatar.mimetype)) {
//         return next(new ErrorHandler("File format not supported", 400));
//     }

//     const {
//         firstName,
//         lastName,
//         email,
//         phone,
//         password,
//         gender,
//         dob,
//         nic,
//         DocterDepatement,
//     } = req.body;

//     if (
//         !firstName ||
//         !lastName ||
//         !email ||
//         !phone ||
//         !password ||
//         !gender ||
//         !dob ||
//         !nic ||
//         !DocterDepatement
//     ) {
//         return next(new ErrorHandler("Please fill all the details", 400));
//     }

//     const isRegistered = await User.findOne({ email });
//     if (isRegistered) {
//         return next(new ErrorHandler(`User already registered with this email`, 400));
//     }
//     // Upload file to Cloudinary
//     const cloudinaryResponse = await cloudinary.v2.uploader.upload(docAvatar.tempFilePath, {
//         folder: "doctors",
//         resource_type: "image",
//     });
//     if (!cloudinaryResponse || cloudinaryResponse.error) {
//         console.log("Cloudinary error:", cloudinaryResponse.error || "Unknown error");
//         return next(new ErrorHandler("File upload failed", 500));
//     }
//     const doctor = await User.create({
//         firstName,
//         lastName,
//         email,
//         phone,
//         password,
//         gender,
//         dob,
//         nic,
//         DocterDepatement,
//         role: "Docter",
//         docAvatar: {
//             public_id: cloudinaryResponse.public_id,
//             url: cloudinaryResponse.secure_url,
//         },
//     });
//     res.status(200).json({
//         success: true,
//         message: "New doctor registered",
//         doctor,
//     });
// });






