# Multiplicity Setup Guide

## What's Been Set Up

### Payload CMS Collections & Globals

#### 1. **Events Collection** (`src/collections/Events.ts`)
Manages all your events with the following fields:
- **Title** - Event name
- **Slug** - URL-friendly identifier
- **Status** - "Upcoming" or "Past"
- **Date** - Event date and time
- **Location** - City, venue, and address
- **Description** - Rich text event details
- **Featured Image** - Main event photo
- **Speakers** - Array of speakers with:
  - Name
  - Title/Role (e.g., "Designer", "Illustrator")
  - Topic
  - Speaker image
- **Ticket URL** - Link to ticket purchase page

#### 2. **Site Settings Global** (`src/globals/SiteSettings.ts`)
Site-wide content management:
- **Hero Image** - Main homepage image
- **About Text** - Description of Multiplicity
- **Social Links** - Instagram & LinkedIn URLs
- **Footer** - Company info and footer links

### Frontend

#### Homepage (`src/app/(frontend)/page.tsx`)
Displays:
- **Header** with navigation and "Buy Tickets" button
- **Hero section** with logo and featured image
- **About section** with description
- **Next Event** section - Shows the upcoming event with:
  - Location and date
  - Speaker lineup
  - Venue details
  - Ticket purchase button
- **Past Events** section - Grid of previous events
- **Footer** with contact info and links

#### Styling (`src/app/(frontend)/styles.css`)
- Matches your design with lime-yellow (#d4ff00) background
- Black text and borders
- Bold, modern typography
- Fully responsive layout
- Hover effects and transitions

## Next Steps

### 1. Start the Development Server
```bash
pnpm dev
```

### 2. Access Payload Admin
Navigate to: `http://localhost:3000/admin`

Create your first admin user, then:

### 3. Add Content in Payload

#### Add Site Settings:
1. Go to "Globals" → "Site Settings"
2. Upload a hero image
3. Add your about text
4. Add social media links
5. Configure footer content

#### Create Events:
1. Go to "Collections" → "Events"
2. Click "Create New"
3. Fill in event details:
   - Title (e.g., "London February 2026")
   - Slug (e.g., "london-february-2026")
   - Status (Upcoming or Past)
   - Date
   - Location details
   - Upload featured image
   - Add speakers
   - Add ticket URL
4. Save & Publish

### 4. View Your Site
Navigate to: `http://localhost:3000`

The homepage will automatically display:
- Your next upcoming event
- Up to 4 past events
- All site settings content

## Design Features

✅ Lime-yellow background matching your design  
✅ Bold black typography  
✅ Responsive grid for past events  
✅ Clean navigation header  
✅ Prominent "Buy Tickets" CTAs  
✅ Speaker listings with topics  
✅ Footer with company info  

## Tech Stack

- **Next.js 15** - React framework
- **Payload CMS 3** - Headless CMS
- **SQLite** - Database
- **S3/R2 Storage** - Media uploads
- **TypeScript** - Type safety

## Customization Tips

### Update Colors
Edit `src/app/(frontend)/styles.css`:
```css
:root {
  --lime-yellow: #d4ff00;  /* Change main background */
  --black: #000000;         /* Change text color */
  --pink: #ffb3d9;         /* Accent color */
}
```

### Add More Event Fields
Edit `src/collections/Events.ts` and add fields, then run:
```bash
pnpm generate:types
```

### Modify Layout
Edit `src/app/(frontend)/page.tsx` to change structure or add sections.

## Common Commands

```bash
# Development
pnpm dev

# Build for production
pnpm build

# Start production server
pnpm start

# Generate TypeScript types
pnpm generate:types

# Generate import map
pnpm generate:importmap

# Run tests
pnpm test
```

## Environment Variables

Make sure your `.env` file has:
```env
DATABASE_URI=file:./multiplicity.db
PAYLOAD_SECRET=your-secret-key

# R2/S3 Storage (for media uploads)
R2_BUCKET_NAME=your-bucket
R2_ACCESS_KEY_ID=your-key
R2_SECRET_ACCESS_KEY=your-secret
R2_ACCOUNT_ID=your-account-id
R2_REGION=auto
```

---

Your Multiplicity site is ready to go! 🎉

