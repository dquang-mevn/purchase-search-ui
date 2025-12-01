# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a demo search API project built with Next.js 15.5.4, featuring a complete UI system with shadcn/ui components and product data management capabilities. The project uses TypeScript and is designed as a product search and management system with Japanese market data.

## Key Technologies

- **Framework**: Next.js 15.5.4 (App Router architecture)
- **Language**: TypeScript with strict configuration
- **Database**: Better SQLite3 with Drizzle ORM for data management
- **UI Library**: shadcn/ui components with Radix UI primitives
- **Styling**: Tailwind CSS v4 with CSS variables
- **Icons**: Lucide React
- **Forms**: React Hook Form with Zod validation
- **Package Manager**: Bun (based on lockfile)

## Commands

### Development
```bash
bun dev          # Start development server
bun build        # Build for production
bun start        # Start production server
bun lint         # Run ESLint
```

## Architecture

### Directory Structure
- `/app/` - Next.js App Router pages and layouts
- `/components/ui/` - Complete shadcn/ui component library (50+ components)
- `/lib/` - Utility functions including Tailwind class merging
- `/hooks/` - Custom React hooks (mobile detection)
- `/pages/api/` - API routes (if using hybrid approach)
- `/public/` - Static assets

### Data Layer
- **Database**: SQLite with Better SQLite3 driver
- **ORM**: Drizzle ORM (version 0.44.6)
- **Schema**: Product data with Japanese market information
- **Seed Data**: 100 product records in `seed-data.json` with comprehensive product information including:
  - Electronics, cameras, drones categories
  - Japanese location data (cities and prefectures)
  - Sales status and inventory management
  - Profit tracking and pricing information

### UI System
The project uses a comprehensive shadcn/ui setup with:
- **Style**: "new-york" variant
- **Base Color**: Neutral
- **CSS Variables**: Enabled for theming
- **Icon Library**: Lucide React
- **Components**: Full suite including forms, navigation, data display, and feedback components

### Configuration
- **Path Aliases**: `@/*` maps to project root
- **TypeScript**: Strict mode enabled with modern ES2017 target
- **ESLint**: Next.js recommended configuration with TypeScript support
- **Tailwind**: v4 configuration with PostCSS

## Development Notes

### Component Architecture
- All UI components follow shadcn/ui patterns with Radix UI primitives
- Components support theme variants through CSS variables
- Form components integrate with React Hook Form and Zod validation

### Data Management
- Product data structure supports Japanese market requirements
- Comprehensive tracking of sales status, inventory, and financial metrics
- Multi-category support (electronics, camera, drone)

### Styling Approach
- Utility-first with Tailwind CSS v4
- CSS variables for dynamic theming
- Component variants using class-variance-authority

This is a modern, well-structured Next.js application with a complete design system and robust data management capabilities, particularly suited for e-commerce or product management applications targeting the Japanese market.