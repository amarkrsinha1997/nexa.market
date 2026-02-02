# Onboarding & Navigation Update

**Date:** 2026-02-02
**Prompt:**
> Install libnexa-ts using which you can validate nexa address from Address.isvalid
> check the documentation
> 
> Here I want to create an onboarding when the user gets onboarded for the first time I want to ask them for there
> DOB, PhoneNumber, and Nexa Wallet Address
> 
> Currently we don't have anything to validate phonenumber but for the nexa we can use Address.isvalid and for getting the DOB it should be Calendar in middle of the mobile for the desktop it should be at the same page
> 
> Remember this application will be both desktop, tablet and mobile freindly
> 
> And for the bottom I need a menu like native app Footer Menu, in desktop it should be humburger
> 
> Create a documentation as well as docs/ there we should have release-notes and features to store both each chat prompts and its results to keep track and the features and its logic to keep track how we want something.
> 
> Create detail plan and todos before starting

**Summary:**
Initialize the `docs/` structure for project tracking. Implement a user onboarding flow for collecting DOB, Phone, and Nexa Address (validated via `libnexa-ts`). additionaly, verify responsive navigation with a mobile footer and desktop hamburger menu.

**Action Plan:**
1.  Install `libnexa-ts`.
2.  Create Onboarding Page (`/onboarding`).
3.  Implement validation logic.
4.  Implement Responsive Navigation Layout.
5.  Update documentation.
