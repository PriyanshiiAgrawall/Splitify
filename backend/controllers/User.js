import bcrypt from "bcryptjs";
import { z } from "zod";
import logger from "../utils/logger.js";
import User from "../models/User.js";
import Group from "../models/Group.js"
import { generateToken, validateToken, validateUser } from "../middlewares/apiAuthentication.js"

//zod is defaulty required if need to make some field optional just put optional there
const userRegistrationInput = z.object({
    firstName: z.string().nonempty("First name is required"),
    lastName: z.string().optional(),
    emailId: z.string().email("Invalid email format"),
    password: z.string().min(8, "Password must be at least 8 characters"),
});

// User Registeration function
// Accepts: firstName, lastName, emailId, password 
// API: /users/v1/register
//TESTED

export const userRegistration = async (req, res) => {
    try {

        const validatedData = userRegistrationInput.parse(req.body);
        //If the input (req.body) does not match the userRegistrationInput, Zod will automatically throw an error we do not manually return respose
        // Check if the email already exists in the database
        const existingUser = await User.findOne({ emailId: validatedData.emailId });
        if (existingUser) {
            logger.error(`URL : ${req.originalUrl} | Status: 403 | Email already exists`);
            return res.status(403).json({
                status: "Fail",
                message: "Email already exists",
            });
        }
        // Hash the password using bcrypt and setting it in place of original password
        //salt - A random string added to a password before hashing to make the hash unique, Even if two users have the same password, the salt ensures their hashes are different, making it harder for attackers to guess passwords.
        const salt = await bcrypt.genSalt(10);
        validatedData.password = await bcrypt.hash(validatedData.password, salt);

        // Create a new user in the database
        const newUser = await User.create(validatedData);

        // Respond with success
        return res.status(200).json({
            status: "Success",
            message: "User Registration Successful,now login to continue",
            userId: newUser._id,
        });
        //id is send as response for further calls ex- updating user,fetching user groups etc

    } catch (err) {

        logger.error(`URL : ${req.originalUrl} | Status: ${err.status || 500} | Message: ${err.message}`);
        res.status(err.status || 500).json({
            status: "Fail",
            message: err.message,
        });
    }
};


/*
User login function
Accepts: email Id & Pass
Route-
*/
//TESTED

const userLoginInput = z.object({
    emailId: z.string().email("Invalid email format"),
    password: z.string().min(8, "Password must be at least 8 characters"),
});
export const userLogin = async (req, res) => {
    try {
        //zod validation for inputted fields
        const validatedData = userLoginInput.parse(req.body);
        //extract what is coming in request
        const { emailId, password } = validatedData;
        //check if email exist in db
        const user = await User.findOne({
            emailId: emailId
        })
        //if user doen't exists

        if (!user) {
            return res.status(403).json({
                message: "You Have Not Yet Registered Please Register then proceed to Login"
            })
        }
        //if user does exist 
        //validate password inputted 
        const passMatches = await bcrypt.compare(password, user.password)

        //if password doesnt match
        if (!passMatches) {
            return res.status(401).json({
                message: "You have inputted wong password, Try Again!"
            })

        }
        //password matches now generate token
        const payload = {
            id: user._id,
            emailId: emailId,
        }
        const token = generateToken(payload);
        //putting token in the user object which we just fetched from the db 
        user.token = token;
        //password is set to undefined to avoid sending it back in the response, ensuring sensitive data is not exposed.
        user.password = undefined;
        //putting this token in authorisation header
        res.setHeader("Authorization", `Bearer ${token}`);

        //now creating cookie to send token in each subsequent request 
        const options = {
            expiresIn: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
            // httpOnly: true,
        };
        return res.cookie("token", token, options).status(200).json({
            message: "Successfully Logged In",
            success: true,
            //we defined all fields of user here so that password doesnt go in response by mistake
            user: user,
            accessToken: token,
        })

    }
    catch (err) {
        console.error('Error during login:', err);
        res.status(500).json({
            message: "Logging in failed",
            success: false,

        })
    }

}

/*
View User function 
This function is to view the user details 
Accepts: user email Id 
Returns: user details (ensure password is removed)
route: 
*/
//TESTED

export const viewUser = async (req, res) => {
    try {


        const emailId = req.query.queryParams;

        //verifyToken middleware puts decoded token in request named as user now this user has email(payload)
        //verifying wmail of user who's data is wanted is same as inputted email
        validateUser(req.user.emailId, emailId)
        const user = await User.findOne({
            emailId: emailId
        }, {
            password: 0
        })//this excludes password field from getting fetched in user object
        if (!user) {
            return res.status(404).json({
                message: "User Not Found!"
            })
        }
        return res.status(200).json({
            status: "Success",
            user: user
        })
    } catch (err) {
        logger.error(`URL: ${req.originalUrl} | Status: ${err.status || 500} | Message: ${err.message}`);
        res.status(err.status || 500).json({
            message: err.message
        })
    }
}


/*
View All User EmailIs function
This function is to get all the user email Id
Accepts: nothing
Returns: all user Email ID who are registered in the app
*/
//why we need this function
//Select group members by their email IDs.
//Send invitations to join the group.
//TESTED

export const fetchAllRegisteredEmails = async (req, res) => {
    try {

        //check the user fetching this is registered user


        // this query gives array of email objects like 
        //     [
        //   { "emailId": "user1@example.com" },
        //   { "emailId": "user2@example.com" }
        // ] 
        //as we explicidely telling mongodb to give us eamil and id which is automatically included we are excluding it manually
        const fetchedEmails = await User.find({}, {
            emailId: 1,
            _id: 0
        });

        if (!fetchedEmails || fetchedEmails.length === 0) {
            return res.status(400).json({
                message: "No registered user emails found"
            })
        }
        let emailList = [];
        for (let email of fetchedEmails) {
            emailList.push(email.emailId);
        }
        //now we'll have ["user1@example.com", "user2@example.com"]
        res.status(200).json({
            success: true,
            users: emailList
        });
    }
    catch (err) {
        logger.error(`URL: ${req.originalUrl} | Status: ${err.status || 500} | Message: ${err.message}`);
        res.status(err.status || 500).json({
            message: err.message
        })
    }

}


/*
Delete User function 
This function is used to delete an existing user in the database 
Accepts: user email id 
*/
export const deleteUser = async (req, res) => {
    try {
        const { emailId } = req.body;

        if (!emailId) {
            return res.status(400).json({
                success: false,
                message: "Email ID is required.",
            });
        }

        // Check if the user exists in the database
        const user = await User.findOne({ emailId });
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "Requested user does not belong to the database.",
            });
        }

        // Validate if the requesting user is the same as the token decoded user
        const tokenUserId = req.user.id;
        if (user._id.toString() !== tokenUserId) {
            return res.status(403).json({
                success: false,
                message: "Unauthorized action: You cannot delete someone else's account.",
            });
        }

        // Check if the user's settlements are cleared
        const groups = await Group.find({ groupMembers: user._id });

        for (let group of groups) {
            for (let split of group.split) {
                if (split.member.toString() === user._id.toString() && split.amount !== 0) {
                    return res.status(401).json({
                        success: false,
                        message: "Cannot delete user. Outstanding settlements must be resolved first.",
                    });
                }
            }
        }

        // Delete the user
        const deleteResponse = await User.deleteOne({ emailId });

        // Remove the user's splits from the groups
        for (let group of groups) {

            group.split = group.split.filter(split => split.member.toString() !== user._id.toString());


            await group.save();
        }
        res.status(200).json({
            success: true,
            message: "User account deleted successfully.",
            response: deleteResponse,
        });

        // Optional: Remove the user's splits from the groups (if required)

    } catch (err) {
        console.error("Error in deleteUser:", err);
        res.status(500).json({
            success: false,
            message: "An error occurred while deleting the user.",
            error: err.message,
        });
    }
};



/*
Edit User function 
This function is used to edit the user present in the database 
Accepts: User data (user emailId can not be changed)
This function can not be used to change the password of the user 
*/


// Define Zod schema for user update validation
const userUpdateSchema = z.object({
    emailId: z.string().email(),
    firstName: z.string().min(1, "First name cannot be empty."),
    lastName: z.string().min(1, "Last name cannot be empty."),
});

export const editUser = async (req, res) => {
    try {
        // Validate user input using Zod
        const { emailId, firstName, lastName } = userUpdateSchema.parse(req.body);

        // Check if the logged-in user is the same as the requested user
        validateUser(req.user.emailId, emailId);

        // Verify if the user exists in the database
        const userExists = await User.findOne({ emailId: emailId })
        if (!userExists) {
            return res.status(403).json({
                message: "User do not exist in db",
                success: false
            })
        }

        // Update the user's firstName and lastName
        const updateResponse = await User.updateOne(
            { emailId },
            {
                $set: {
                    firstName,
                    lastName,
                },
            }
        );

        // Respond with success
        res.status(200).json({
            status: "Success",
            message: "User update successful",
            userId: updateResponse,
        });
    } catch (err) {
        // Log the error
        logger.error(`URL: ${req.originalUrl} | Status: ${err.status || 500} | Message: ${err.message}`);

        // Handle validation errors
        if (err instanceof z.ZodError) {
            return res.status(400).json({
                status: "Failure",
                message: "Validation error",
                errors: err.errors,
            });
        }

        // Respond with the error
        res.status(err.status || 500).json({
            status: "Failure",
            message: err.message,
        });
    }
};





/*
Update Password function 
This function is used to update the user password 
Accepts : emailId 
          new password 
          old password 
validation : old password is correct 
             new password meet the requirements 
*/



const updatePasswordSchema = z.object({
    emailId: z.string().email({ message: 'Invalid email address.' }),
    oldPassword: z.string().nonempty({ message: 'Old password is required.' }),
    newPassword: z
        .string()
        .min(8, { message: 'New password must be at least 8 characters long.' }),
});

export const updatePassword = async (req, res) => {
    try {

        const { emailId, oldPassword, newPassword } = updatePasswordSchema.parse(req.body);


        validateUser(req.user.emailId, emailId);

        // Find the user by email
        const user = await User.findOne({ emailId });
        if (!user) {
            return res.status(404).json({
                status: 'Failure',
                message: 'User does not exist.',
            });
        }

        // Validate the old password using bcrypt
        const validCred = await bcrypt.compare(oldPassword, user.password);
        if (!validCred) {
            return res.status(400).json({
                status: 'Failure',
                message: 'Old password does not match.',
            });
        }

        // Hash the new password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        // Update the password in the database
        const updateResponse = await User.updateOne(
            { emailId },
            { $set: { password: hashedPassword } }
        );


        return res.status(200).json({
            status: 'Success',
            message: 'Password updated successfully.',
            updateResponse,
        });
    } catch (err) {

        logger.error(`URL: ${req.originalUrl} | Status: ${err.status || 500} | Message: ${err.message} | Stack: ${err.stack}`);


        if (err instanceof z.ZodError) {
            return res.status(400).json({
                status: 'Failure',
                message: 'Validation error.',
                errors: err.errors,
            });
        }

        return res.status(err.status || 500).json({
            status: 'Failure',
            message: err.message || 'An error occurred.',
        });
    }
};