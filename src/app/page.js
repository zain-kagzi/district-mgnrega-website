// src/app/page.js
import DistrictDashboard from '@/components/DistrictDashboard';

export const metadata = {
  title: 'MGNREGA District Dashboard | मनरेगा जिला डैशबोर्ड',
  description: 'Track MGNREGA performance in your district - महात्मा गांधी राष्ट्रीय ग्रामीण रोजगार गारंटी योजना',
  keywords: 'MGNREGA, मनरेगा, rural employment, Uttar Pradesh, government scheme',
};

export default function Home() {
  return (
    <main>
      <DistrictDashboard />
    </main>
  );
}