export async function sendEmailAlert(message: string, severity: 'info' | 'warning' | 'error') {
  const smtpHost = process.env.EMAIL_SMTP_HOST
  const smtpUser = process.env.EMAIL_SMTP_USER
  const smtpPass = process.env.EMAIL_SMTP_PASS
  const emailTo = process.env.EMAIL_TO
  
  if (!smtpHost || !smtpUser || !smtpPass || !emailTo) {
    console.log('Email configuration incomplete, skipping alert')
    return
  }
  
  try {
    const nodemailer = require('nodemailer')
    
    const transporter = nodemailer.createTransporter({
      host: smtpHost,
      port: parseInt(process.env.EMAIL_SMTP_PORT || '587'),
      secure: false,
      auth: {
        user: smtpUser,
        pass: smtpPass,
      },
    })

    const subject = `[${severity.toUpperCase()}] Plugg Gymnasie Alert`
    const htmlMessage = `
      <h2>Plugg Gymnasie System Alert</h2>
      <p><strong>Severity:</strong> ${severity.toUpperCase()}</p>
      <p><strong>Message:</strong> ${message}</p>
      <p><strong>Timestamp:</strong> ${new Date().toISOString()}</p>
    `

    await transporter.sendMail({
      from: smtpUser,
      to: emailTo,
      subject: subject,
      html: htmlMessage,
    })
    
    console.log(`Email alert sent: ${message}`)
  } catch (error) {
    console.error('Error sending email alert:', error)
  }
}
