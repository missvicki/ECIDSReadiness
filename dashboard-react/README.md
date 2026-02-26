# 🚀 ECIDS React Dashboard

Modern, production-ready dashboard for the ECIDS Readiness Risk Index built with React/Next.js.

## Features

✅ **9 Interactive Pages**
- 📍 Overview - Key metrics and high-level insights
- 📊 Risk Distribution - Risk tier breakdowns
- 🎯 Domain Decomposition - 4-domain analysis
- 📅 Participation & Stability - Enrollment patterns
- 🏥 Developmental Signals - Screenings and outcomes
- 🌎 Geographic & Context - County and district analysis
- 🔮 Predictive Simulation - Future risk modeling
- 📚 Data Methodology - How test data was created
- 💡 Use Cases - Practical application scenarios

✅ **Advanced Filtering**
- County filter
- District filter (dependent on county)
- Risk tier filter
- Poverty level filter

✅ **Professional UI**
- Modern design with Tailwind CSS
- Responsive layout (mobile, tablet, desktop)
- Interactive charts with Recharts
- Smooth animations and transitions
- TypeScript for type safety

## Tech Stack

- **Next.js 14** - React framework with App Router
- **TypeScript** - Type safety
- **Tailwind CSS** - Modern styling
- **Recharts** - React charting library
- **Papa Parse** - CSV parsing

## Quick Start

### 1. Install Dependencies

```bash
cd dashboard-react
npm install
```

### 2. Verify Data Symlink

The data should already be linked. Verify with:

```bash
ls -la public/data
```

If not linked:

```bash
cd public
ln -s ../../synthetic_data data
```

### 3. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 4. Build for Production

```bash
npm run build
npm start
```

## Project Structure

```
dashboard-react/
├── src/
│   ├── app/                    # Next.js pages (App Router)
│   │   ├── layout.tsx          # Root layout
│   │   ├── page.tsx            # Overview page
│   │   ├── geography/          # Geography page
│   │   ├── methodology/        # Data methodology page
│   │   └── use-cases/          # Use cases page
│   ├── components/
│   │   ├── Navigation.tsx      # Top navigation
│   │   ├── Filters.tsx         # Global filters (4 columns)
│   │   ├── MetricCard.tsx      # KPI cards
│   │   ├── charts/             # Chart components
│   │   └── layout/             # Layout components
│   ├── lib/
│   │   ├── dataLoader.ts       # CSV loading logic
│   │   └── types.ts            # TypeScript types
│   └── styles/
│       └── globals.css         # Global styles
├── public/
│   └── data/                   # Symlink to synthetic_data/
├── package.json
├── next.config.js
├── tailwind.config.ts
└── tsconfig.json
```

## Key Features Implemented

### 1. District Filtering
- 4-column filter layout
- District dropdown updates based on selected county
- Cascading filter logic

### 2. Geography Page with District Analysis
- County risk chart (top 15)
- **District risk chart (top 20)** ← NEW
- Poverty vs risk analysis
- Household stressors correlation

### 3. Data Methodology Page
- Documents synthetic data generation
- Explains 9 flat file structure
- Details risk scoring model
- Describes validation approach

### 4. Use Cases Page
- 6 practical scenarios for different stakeholders
- Step-by-step guidance
- Expected outcomes
- Getting started section

## Deployment

### Deploy to Vercel (Recommended)

1. Install Vercel CLI:
```bash
npm i -g vercel
```

2. Deploy:
```bash
cd dashboard-react
vercel
```

Follow the prompts. You'll get a production URL like: `ecids-dashboard.vercel.app`

### Deploy to Netlify

1. Build the project:
```bash
npm run build
```

2. Deploy the `.next` directory to Netlify

## Advantages Over Streamlit

1. **Performance** - Faster load times, smoother interactions
2. **Professional UI** - Modern SaaS-like appearance
3. **Mobile Responsive** - Works on all devices
4. **Custom Domain** - Easy to deploy with custom URL
5. **Scalable** - Industry-standard stack
6. **Type Safety** - TypeScript catches errors at compile time

## Environment Variables

No environment variables needed for development. All data is loaded from local CSV files.

For production with API backend:
```env
NEXT_PUBLIC_API_URL=https://your-api.com
```

## Customization

### Change Color Theme

Edit `tailwind.config.ts`:
```typescript
colors: {
  primary: {
    500: '#your-color',
    // ...
  }
}
```

### Add New Pages

1. Create `src/app/your-page/page.tsx`
2. Add route to `src/components/Navigation.tsx`

### Modify Charts

Chart components are in `src/components/charts/`. Edit props or create new chart types as needed.

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## License

This is a demonstration project with synthetic data. Not licensed for production use without proper data governance.

## Support

For issues or questions, review the Data Methodology and Use Cases pages in the dashboard, or refer to the project documentation.

---

**Built with ❤️ using Next.js, React, and TypeScript**
