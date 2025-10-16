# Forefront Project Context

## Project Overview
This is a Next.js 15.5.4 application (App Router) for an educational/social networking platform called "Forefront". It's a learning management system with social features, profiles, modules, and networking capabilities.

## Tech Stack
- **Framework**: Next.js 15.5.4 with App Router
- **Language**: TypeScript
- **Database**: Drizzle ORM with PostgreSQL
- **Styling**: Inline styles with responsive design (no CSS framework)
- **Authentication**: Custom user system

## Project Structure
```
/app
  /api              - API routes
    /modules        - Module management
    /posts          - Social posts
    /users/[id]     - User CRUD
    /stats          - Statistics (has errors with userProgress)
    /learning       - Learning progress
    /connections    - User connections
    /submissions    - Assignment submissions
  /profile          - Profile settings page
  /network          - Social network feed
  /dashboard        - User dashboard
  /modules/[slug]   - Module pages
  /admin            - Admin panel

/components
  /profile
    ImageCropper.tsx        - Image crop tool (CURRENTLY BROKEN)
    ExpandableSection.tsx   - Collapsible content sections
    ProfilePreview.tsx      - Live profile preview

/lib
  /db
    schema.ts       - Database schema (missing userProgress export)
```

## Current Issues

### 1. Image Cropper (BROKEN - HIGH PRIORITY)
**Location**: `/components/profile/ImageCropper.tsx`

**Problem**: The image cropper for profile pictures and banners is squeezing/distorting images instead of maintaining aspect ratio.

**What it should do** (Instagram/Twitter style):
- Show a fixed crop frame (circular for profile, rectangular 4:1 for banner)
- Allow user to drag and zoom the image underneath the frame
- Dark overlay showing what will be cropped out
- Maintain image aspect ratio at all times
- Output properly cropped image as base64

**Current implementation issues**:
- Lines 38-68: Initial zoom calculation is forcing image to cover crop frame but causing distortion
- The minimum zoom calculation (`Math.max(minZoomX, minZoomY)`) works correctly
- BUT the image is being squeezed when rendered
- Aspect ratio is NOT being preserved properly

**Key dimensions**:
- Banner container: 800x400px
- Banner crop frame: 800x200px (4:1 ratio)
- Banner output: 1200x300px
- Profile container: 500x500px
- Profile crop frame: 400x400px (1:1 ratio)
- Profile output: 400x400px

**Previous attempts that failed**:
- Tried calculating `displayWidth/displayHeight` based on container aspect ratio
- Tried using `Math.max(initialZoom, calculatedMinZoom)`
- Tried recalculating display dimensions with actual zoom
- All approaches still resulted in squeezing

**Interface**:
```typescript
interface ImageCropperProps {
  imageUrl: string
  type: 'profile' | 'banner'
  onComplete: (croppedImage: string) => void
  onCancel: () => void
}
```

### 2. Missing Database Schema Export
**Location**: `/lib/db/schema.ts`

**Problem**: `userProgress` table is not exported, causing errors in `/app/api/stats/route.ts:69`

**Error**:
```
Attempted import error: 'userProgress' is not exported from '@/lib/db/schema'
TypeError: Cannot read properties of undefined (reading 'Symbol(drizzle:IsAlias)')
```

## Recent Work Completed

### Profile Settings Page (`/app/profile/page.tsx`)
1. **Segmented Control**: Created iOS-style animated tab switcher (basic/comprehensive/preview)
   - Sliding black indicator that smoothly transitions between tabs
   - Dynamically sizes to fit button content
   - Uses refs to measure button dimensions
   - Background changed from white to #fafafa

2. **Profile Preview**: Added live preview tab with gradient fade
   - All sections wrapped in `ExpandableSection` component
   - Shows truncated content with "show more" button
   - Matches network view styling

3. **Image Upload Flow**:
   - User clicks "change photo" button
   - Opens file picker
   - Shows ImageCropper modal
   - User crops image
   - `handleCropComplete` receives base64 cropped image
   - Updates `formData.profileImage` or `formData.bannerImage`

### ExpandableSection Component
**Location**: `/components/profile/ExpandableSection.tsx`

**Features**:
- Gradient fade overlay when content exceeds `maxCollapsedHeight` (default 150px)
- Smooth expand/collapse animation
- "show more/less" button
- Gradient uses #fafafa colors to match page background

### ProfilePreview Component
**Location**: `/components/profile/ProfilePreview.tsx`

**Features**:
- Modal overlay with profile preview
- Shows all profile sections with ExpandableSection wrappers
- Respects visibility settings
- Close button and click-outside-to-close

## Design System

### Typography
- **Headings**: lowercase, bold (700-900), tight letter-spacing (-1px to 0.3px)
- **Body**: 13-14px, color #333, line-height 1.6
- **Labels**: uppercase, 11-12px, bold, letter-spacing 1px

### Colors
- **Background**: #fafafa
- **Cards**: #fff with 2-3px solid #000 borders
- **Text**: #000 (headings), #333 (body), #666 (secondary), #999 (tertiary)
- **Borders**: #e0e0e0 (light), #000 (strong)
- **Overlays**: rgba(0, 0, 0, 0.6) for dark overlays

### Borders & Radius
- **Border width**: 2-3px solid
- **Border radius**: 6-16px (smaller for tags, larger for modals)
- **Crop frame border**: 3px solid #fff

### Responsive
- Uses `clamp()` for responsive font sizes
- Example: `fontSize: 'clamp(13px, 2vw, 14px)'`

## User Profile Type
```typescript
interface UserProfile {
  id: string
  name: string
  email?: string
  headline?: string
  bio?: string
  summary?: string
  location?: string
  profileImage?: string
  bannerImage?: string
  skills?: Array<{ name: string }>
  experience?: Array<Experience>
  education?: Array<Education>
  certifications?: Array<Certification>
  projects?: Array<Project>
  awards?: Array<Award>
  profileVisibility?: {
    experience?: boolean
    education?: boolean
    skills?: boolean
    certifications?: boolean
    projects?: boolean
    awards?: boolean
  }
}
```

## API Endpoints
- `GET/PUT /api/users/[id]` - User CRUD
- `GET /api/modules` - List modules
- `GET /api/posts` - Social feed posts
- `GET /api/learning` - User learning progress
- `GET /api/stats` - Platform statistics (BROKEN)
- `GET /api/connections/suggestions` - Connection suggestions

## Running the App
```bash
npm run dev
```
- Runs on port 3001 (port 3000 is in use)
- Local: http://localhost:3001

## Known Warnings/Errors
1. **userProgress import error** - Stats API route broken
2. **Multiple lockfiles warning** - Has lockfiles in both root and project directory
3. **Fast Refresh full reload** - Due to userProgress error

## Next Steps for Image Cropper Fix

The core issue is maintaining aspect ratio while ensuring the crop frame is covered. The solution needs to:

1. Load the image and get its natural dimensions
2. Calculate the zoom needed to cover the crop frame in BOTH dimensions
3. Apply that zoom uniformly to BOTH width and height
4. The image should ALWAYS render at `width: naturalWidth * zoom` and `height: naturalHeight * zoom`
5. Never calculate separate width/height values - always derive from zoom

Consider using a canvas-based approach or verifying the img element's rendering is truly using the zoom value for both dimensions.

## File Modifications in This Session
1. `/app/profile/page.tsx` - Segmented control, removed position/zoom state, fixed removeImage function
2. `/components/profile/ImageCropper.tsx` - Multiple attempts to fix squeezing (ALL FAILED)
3. `/components/profile/ExpandableSection.tsx` - Enhanced gradient overlay
4. `/components/profile/ProfilePreview.tsx` - Wrapped sections with ExpandableSection

---

**Last Updated**: 2025-10-15
**Status**: Image cropper feature broken - needs complete rewrite
