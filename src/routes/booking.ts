import express, { Request, Response } from "express";
import { body, validationResult } from "express-validator";
import nodemailer from "nodemailer";

const router = express.Router();

router.post(
  "/",
  [
    body("title").notEmpty().withMessage("The service title is required."),
    body("fullName")
      .matches(/^[a-zA-Z\s\-]+$/)
      .withMessage(
        "The full name must contain only letters, spaces, or hyphens."
      )
      .notEmpty()
      .withMessage("Full name is required."),
    body("email")
      .matches(/\S+@\S+\.\S+/)
      .withMessage("A valid email address is required.")
      .notEmpty()
      .withMessage("Email address is required."),
    body("phone")
      .matches(/^\+?[0-9]{7,15}$/)
      .withMessage("A valid phone number is required.")
      .notEmpty()
      .withMessage("Phone number is required."),
    body("address").notEmpty().withMessage("The address is required."),
    body("date").isISO8601().withMessage("A valid date is required."),
    body("time")
      .matches(/^([01]\d|2[0-3]):?([0-5]\d)$/)
      .withMessage("A valid time is required."),
  ],
  async (req: Request, res: Response): Promise<void> => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }

    const { title, fullName, email, phone, address, date, time, comments } =
      req.body;

    try {
      const testAccount = await nodemailer.createTestAccount();

      const transporter = nodemailer.createTransport({
        host: "smtp.ethereal.email",
        port: 587,
        secure: false,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass,
        },
      });

      const mailOptions = {
        from: `"${fullName}" <${email}>`,
        to: "recipient@example.com",
        subject: `New Booking for ${title}`,
        text: `Service: ${title}\nName: ${fullName}\nEmail: ${email}\nPhone: ${phone}\nAddress: ${address}\nDate: ${date}\nTime: ${time}\nComments: ${
          comments || "None"
        }`,
      };

      const info = await transporter.sendMail(mailOptions);

      res.status(200).json({
        success: "Booking request sent successfully!",
        previewUrl: nodemailer.getTestMessageUrl(info),
      });
    } catch (error) {
      console.error("Error sending booking email:", error);
      res.status(500).json({ error: "Failed to send the booking request." });
    }
  }
);

export default router;
