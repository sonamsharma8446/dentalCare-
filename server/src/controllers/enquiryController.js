import * as enquiryService from '../services/enquiryService.js';

// POST /api/v1/enquiries   (public; validated and rate limited in the route)
export async function createEnquiry(req, res) {
  await enquiryService.createEnquiry(req.body);
  // Spam bots (hidden field filled in) get the same answer, so they learn nothing
  res.status(201).json({ success: true, message: 'Thank you! Your message has been sent. We will get back to you soon.' });
}