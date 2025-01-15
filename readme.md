<h1 align="center">
  <br>
  <a href="https://natours-xbsh.onrender.com/"></a>
  <br>
  Natours
  <br>
</h1>

<h4 align="center">An awesome tour booking site built with <a href="https://nodejs.org/en/" target="_blank">NodeJS</a>.</h4>

## Key Features 📝

- Authentication & Authorization
  - **Sign up, Log in, Logout, Update, Reset Password**.
  - Users can be **Regular User**, **Admin**, **Lead Guide**, or **Guide**.
  - Default role on sign up: **Regular User**.

- User Profile
  - Users can update **username, photo, email, password**, and other information.
  
- Tours
  - **Admin** and **Lead Guide** can **create, update**, and **delete** tours.
  - All users can **view tours**.
  - **Booking, map, reviews, and ratings** are available for all tours.

- Bookings
  - Only **Regular Users** can book tours (with payment).
  - Regular users cannot book the same tour twice.
  - **Admin** and **Lead Guide** can view, **create**, **edit**, and **delete** any booking.
  - **Regular Users** can see their bookings.

- Reviews
  - Only **Regular Users** can write reviews for tours they've booked.
  - Users can **edit** and **delete** their own reviews.
  - **Admin** can delete any review.
  - Users cannot review the same tour twice.

- Favorite Tours
  - **Regular Users** can add/remove booked tours to/from their favorite list.
  - A tour can only be added once to a user's favorites.

- Credit card payment using Stripe

## Demo 📽️

#### Home Page
![Home Page](https://user-images.githubusercontent.com/58518192/72606801-7ebe0680-3949-11ea-8e88-613f022a64e5.gif)

#### Tour Details
![Tour Overview](https://user-images.githubusercontent.com/58518192/72606859-a0b78900-3949-11ea-8f0d-ef44c789957b.gif)

#### Payment Process
![Payment Process](https://user-images.githubusercontent.com/58518192/72606973-d9eff900-3949-11ea-9a2e-f84a6581bef3.gif)

#### Booked Tours
![Booked Tours](https://user-images.githubusercontent.com/58518192/72607747-6a7b0900-394b-11ea-8b9f-5330531ca2eb.png)

#### User Profile
![User Profile](https://user-images.githubusercontent.com/58518192/72607635-44edff80-394b-11ea-8943-64c48f6f19aa.png)

#### Admin Profile
![Admin Profile](https://user-images.githubusercontent.com/58518192/72607648-4d463a80-394b-11ea-972f-a73160cfaa5b.png)

---

## Getting Started 🚀

### How to Book a Tour
1. **Sign In** to your account.
2. Browse and search for the tours that interest you.
3. **Select a Tour** and complete the booking process.
4. Proceed to **Payment Checkout**.
5. Enter the following test card details:
    ```
    - Card No. : 4242 4242 4242 4242
    - Expiry date: 02 / 22
    - CVV: 222
    ```
6. Done! Your tour is booked!

### Manage Your Booking
- After booking, visit the "Manage Booking" page under your profile to view or edit your tour reservations.

### Update Your Profile
- Update your username, profile photo, email, and password anytime in the **Profile Settings** section.

---

## Tech Stack 🛠️

- **Node.js**: JavaScript runtime environment.
- **Express**: Web framework.
- **Mongoose**: ODM library for MongoDB.
- **MongoDB Atlas**: Cloud database.
- **Pug**: Template engine.
- **JWT**: JSON Web Token for authentication.
- **Parcel**: Blazing fast web application bundler.
- **Stripe**: Online payment gateway.
- **Postman**: API testing tool.
- **Mailtrap** & **Sendgrid**: Email delivery services.
- **Heroku**: Cloud platform.
- **Mapbox**: Map service for displaying tour locations.

---

## Local Setup ⚙️

To run the app locally, follow these steps:

1. Clone the repo to your machine:
    ```
    git clone https://github.com/js313/natours.git
    ```
2. Navigate into the project directory:
    ```
    cd natours
    ```
3. Install dependencies:
    ```
    npm install
    ```
4. Set up environment variables in a `.env` file:
    ```
    DATABASE=your MongoDB URL
    DATABASE_PASSWORD=your MongoDB password
    SECRET=your JWT secret
    JWT_EXPIRES_IN=90d
    JWT_COOKIE_EXPIRES_IN=90
    EMAIL_USERNAME=your Mailtrap username
    EMAIL_PASSWORD=your Mailtrap password
    EMAIL_HOST=smtp.mailtrap.io
    EMAIL_PORT=2525
    EMAIL_FROM=your real email address
    SENDGRID_USERNAME=apikey
    SENDGRID_PASSWORD=your Sendgrid password
    STRIPE_SECRET_KEY=your Stripe secret key
    STRIPE_WEBHOOK_SECRET=your Stripe webhook secret
    ```
5. Start the server:
    ```
    npm run dev
    ```
---

## API Usage 💻

To interact with the Natours API, set up the following variables in Postman for both development and production environments:

- {{URL}} : Set this to your app's base URL (e.g., http://127.0.0.1:3000 or http://www.example.com).
- {{password}} : Your user password.

---

## Contributing 💡

Contributions are welcome! If you want to contribute, please open an issue first to discuss your ideas.

---

## License 📄

This project is licensed under the [MIT License](https://opensource.org/licenses/MIT).

---

## Acknowledgements 🙏

- This project is inspired by the **Node.js, Express, MongoDB & More: The Complete Bootcamp** course by Jonas Schmedtmann on Udemy.
- Thanks to **Jonas Schmedtmann** for creating this amazing learning experience.

---
