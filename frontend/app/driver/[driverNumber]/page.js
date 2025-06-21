import DriverPageClient from './DriverPageClient'

// Generate static params for common F1 driver numbers
export async function generateStaticParams() {
  // Common F1 driver numbers for 2024 season
  const driverNumbers = [
    '1', '2', '3', '4', '10', '11', '14', '16', '18', '20',
    '22', '23', '24', '27', '31', '40', '44', '55', '63', '77', '81'
  ]
  
  return driverNumbers.map((number) => ({
    driverNumber: number,
  }))
}

export default function DriverPage({ params }) {
  return <DriverPageClient driverNumber={params.driverNumber} />
} 