import express, { Request, Response } from "express";
import { body, validationResult } from "express-validator";
import nodemailer from "nodemailer";

const router = express.Router();

router.post(
  "/",
  [
    body("lastName")
      .matches(/^[a-zA-Z\s\-]+$/)
      .withMessage(
        "The last name must contain only letters, spaces, or hyphens."
      )
      .notEmpty()
      .withMessage("Last name is required."),

    body("firstName")
      .matches(/^[a-zA-Z\s\-]+$/)
      .withMessage(
        "The first name must contain only letters, spaces, or hyphens."
      )
      .notEmpty()
      .withMessage("First name is required."),

    body("email")
      .matches(/\S+@\S+\.\S+/)
      .withMessage("A valid email address is required.")
      .notEmpty()
      .withMessage("Email address is required."),

    body("message").notEmpty().withMessage("A message is required."),
  ],

  async (req: Request, res: Response): Promise<void> => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }

    const { lastName, firstName, email, message } = req.body;

    if (!lastName || !firstName || !email || !message) {
      res.status(400).json({ error: "All fields are required." });
      return;
    }

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
        from: `"${lastName}" "${firstName}" <${email}>`,
        to: "recipient@example.com",
        subject: `New Contact Message from ${lastName} ${firstName}`,
        text: `Nom: ${lastName} ${firstName}\n\nEmail: ${email}\n\nMessage:\n${message}`,
      };

      const info = await transporter.sendMail(mailOptions);

      res.status(200).json({
        success: "Message sent successfully!",
        previewUrl: nodemailer.getTestMessageUrl(info),
      });
    } catch (error) {
      console.error("Error sending email:", error);
      res.status(500).json({ error: "Failed to send the message." });
    }
  }
);

export default router;
