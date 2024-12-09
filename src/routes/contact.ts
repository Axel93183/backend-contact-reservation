import express, { Request, Response } from "express";
import { body, validationResult } from "express-validator";
import nodemailer from "nodemailer";

const router = express.Router();

router.post(
  "/",
  [
    body("name")
      .matches(/^[a-zA-Z\s\-]+$/)
      .withMessage(
        "Le nom doit contenir uniquement des lettres, des espaces ou des tirets."
      )
      .notEmpty()
      .withMessage("Le nom est requis."),

    body("email")
      .matches(/\S+@\S+\.\S+/)
      .withMessage("Une adresse email valide est requise.")
      .notEmpty()
      .withMessage("L'adresse email est requise."),

    body("message").notEmpty().withMessage("Le message est requis."),
  ],
  async (req: Request, res: Response): Promise<void> => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }

    const { name, email, message } = req.body;

    if (!name || !email || !message) {
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
        from: `"${name}" <${email}>`,
        to: "recipient@example.com",
        subject: `New Contact Message from ${name}`,
        text: `Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`,
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
