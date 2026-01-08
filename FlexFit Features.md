## ![ref1]![ref1]![ref1]<a name="📄 flexfit – feature development stateme"></a>📄 **FLEXFIT – Feature DEVELOPMENT**
**STATEMENT OF WORK (Features Only)**

**Version 1.0**

**Prepared for Developers**

1. ## <a name="1. feature scope "></a>**Feature SCOPE**
The Feature includes **User App**, **Gym Owner Panel**, and **Admin Panel** with core booking + approval workflows.

1. # <a name="2. features to be developed (feature onl"></a>**FEATURES TO BE DEVELOPED**
## **(Feature ONLY)**

1. <a name="a. user app (customer facing) "></a>**USER APP (Customer Facing)**
   1. ### <a name="1. authentication module "></a>**Authentication Module**
      0. Mobile number login

0. Send OTP

0. Verify OTP

0. Create/update user profile:

0. Name

0. ![ref1]![ref1]Age

0. Gender

0. Profile picture (optional)



1. ### <a name="2. home & gym discovery "></a>**Home & Gym Discovery**
   0. Auto-detect current location

0. Display nearby gyms

0. Sorting:

0. Distance (default)

0. Rating (fallback)

0. Filters (Feature):

0. Price range

0. Category = Gym (only for Feature)

0. Gym list card:

0. Gym name

0. Thumbnail

0. Distance

0. Starting price

0. Rating



1. ### <a name="3. gym detail page "></a>**Gym Detail Page**
   ###
0. ![ref1]Image carousel (up to 5 images)

0. Gym description

0. Amenities list (checkbox options)

0. Opening hours

0. Address

0. Map view

0. Rating (static for Feature)

0. **Pricing: Day Pass Only**

0. Rules/instructions



1. ### <a name="4. booking system (day pass only) "></a>**Booking System (Day Pass Only)**
   0. Select date

0. View price

0. Booking summary

0. Initiate payment

0. Payment success → create booking

0. Auto-generate:

0. Booking ID

0. QR code

0. Show confirmation screen

0. Add booking to history

![ref1]![ref1]![ref1]![ref1]
1. ### <a name="5. booking history module "></a>**Booking History Module**
   0. List all user bookings

0. Show:

0. Gym name

0. Booking date

0. Price

0. Status (Confirmed / Used / Expired)

0. QR code



1. ### <a name="6. profile section "></a>**Profile Section**
   0. Edit profile (name, age, gender)

0. View support options

0. Logout


1. # <a name="b. gym owner panel "></a>**GYM OWNER PANEL**
   1. ### <a name="1. owner authentication "></a>**Owner Authentication**
      0. Register/login using mobile OTP

1. ### ![ref1]<a name="2. gym registration flow "></a>**Gym Registration Flow**
Gym owner can submit:

0. Gym name

0. Address

0. Description

0. Amenities (checkbox)

0. Day pass price

0. Photos (up to 5)

0. Operating hours

0. Submit for approval


Gym status after submission:

0. Pending

0. Approved

0. Disabled



1. ### <a name="3. gym dashboard "></a>**Gym Dashboard**
   0. Show gym status

0. View all bookings:

0. Booking ID

0. User name

0. Date

0. ![ref1]![ref1]![ref1]Price

0. Status

0. QR Check-in System:

0. Scan QR

0. Validate booking

0. Mark as “Used”



1. ### <a name="4. update gym details "></a>**Update Gym Details**
Owner can update:

0. Description

0. Price

0. Photos

0. Amenities

0. Operating hours


1. # <a name="c. admin panel "></a>**ADMIN PANEL**
   1. ### <a name="1. admin authentication "></a>**Admin Authentication**
      0. Email + password login

1. ### ![ref1]![ref1]<a name="2. gym approvals "></a>**Gym Approvals**
Admin can:

0. View list of pending gyms

0. View gym details

0. Approve gym

0. Reject gym

0. Add rejection reason



1. ### <a name="3. booking monitoring "></a>**Booking Monitoring**
Admin can view:

0. All bookings

0. Filters:

0. Date

0. Gym

0. User

0. Status



1. ### <a name="4. dashboard overview "></a>**Dashboard Overview**
Admin sees:

0. Total gyms

0. ![ref1]![ref1]![ref1]Approved gyms

0. Pending gyms

0. Total bookings

0. Total revenue (from commissions)


1. # <a name="3. required system flows "></a>**REQUIRED SYSTEM FLOWS**

1. ## <a name="a. user booking flow "></a>**User Booking Flow**
   1. Login

1. Home screen → Gym list

1. Open gym detail

1. Select date

1. Payment

1. Booking created

1. QR code generated

1. Gym visit

1. Show QR at entry


1. ## <a name="b. gym owner flow "></a>**Gym Owner Flow**
##
1. ![ref1]![ref1]Owner login

1. Register gym

1. Wait for admin approval

1. After approval:

0. View bookings

0. Scan QR

0. Validate and mark used

0. Update gym details


1. ## <a name="c. admin flow "></a>**Admin Flow**
   1. Admin login

1. View & approve gyms

1. View bookings → User

1. Monitor activity


1. # <a name="4. acceptance criteria "></a>**ACCEPTANCE CRITERIA**
- Users must be able to discover gyms by location.

- Day Pass booking with payment must work end-to-end.

- QR code must be generated for every booking.

- ![ref1]![ref1]Gym owners must be able to validate QR codes.

- Admin must approve gyms before they appear in listings.

- Booking history must show accurate statuses (Confirmed/Used/Expired).

- Gym owner cannot mark the same booking as “Used” more than once.

- Only approved gyms should be visible to users.


1. ## <a name="5. out of scope (not included in feature"></a>**OUT OF SCOPE (Not included in Feature)**
   To avoid confusion:

   ❌ Weekly/Monthly/Custom packages

   ❌ Reviews & ratings submission

   ❌ Owner subscription plans

   ❌ Advanced analytics

   ❌ Refund automation

   ❌ Corporate accounts

   ❌ Badges & categories (Top Rated, Luxury)

   ❌ Multi-city homepage design

1. # <a name="6. deliverables "></a>**DELIVERABLES**
#### <a name="user app "></a>**User App**
- Authentication

- ![ref1]Gym discovery

- Gym detail

- Day pass booking

- Payment

- QR code

- Booking history

- Profile page


#### <a name="gym owner panel "></a>**Gym Owner Panel**
- OTP login

- Gym registration

- Gym dashboard

- QR check-in


#### <a name="admin panel "></a>**Admin Panel**
- Login

- Gym approvals

- Booking monitoring

- Dashboard

[ref1]: Aspose.Words.8d1d78c9-922d-421b-89f3-a850fabbf5cf.001.png
