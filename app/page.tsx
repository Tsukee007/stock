import SpacesMap from '@/components/map/SpacesMap'

const testSpaces = [
  {
    id: '1',
    title: 'Garage spacieux',
    city: 'Paris',
    lat: 48.8566,
    lng: 2.3522,
    price_month: 80,
    type: 'garage'
  },
  {
    id: '2',
    title: 'Cave sèche',
    city: 'Lyon',
    lat: 45.7640,
    lng: 4.8357,
    price_month: 50,
    type: 'cave'
  },
  {
    id: '3',
    title: 'Box sécurisé',
    city: 'Marseille',
    lat: 43.2965,
    lng: 5.3698,
    price_month: 65,
    type: 'box'
  }
]

export default function Home() {
  return (
    <main className="flex flex-col h-screen">
      <header className="bg-white shadow-sm p-4 flex items-center justify-between">
        <h1 className="text-xl font-bold text-blue-600">🗄️ Nestock</h1>
        <div className="flex gap-3">
          <a href="/login" className="text-sm text-gray-600 hover:text-blue-600">
            Connexion
          </a>
          <a href="/spaces/new" className="text-sm bg-blue-600 text-white px-3 py-1 rounded-lg hover:bg-blue-700">
            + Déposer une annonce
          </a>
        </div>
      </header>
      <div className="flex-1">
        <SpacesMap spaces={testSpaces} />
      </div>
    </main>
  )
}
