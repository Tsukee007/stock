'use client'

type Props = {
  ownerPrice: number
}

export default function PriceSimulator({ ownerPrice }: Props) {
  const nestock = ownerPrice * 0.10
  const subtotal = ownerPrice + nestock
  const stripeFees = subtotal * 0.015 + 0.25
  const totalRenter = Math.ceil((subtotal + stripeFees) * 100) / 100
  const nestockNet = (totalRenter - ownerPrice - (totalRenter * 0.015 + 0.25)).toFixed(2)
  const stripeFormula = (totalRenter * 0.015 + 0.25).toFixed(2)

  return (
    <div className="bg-blue-50 rounded-xl p-4 space-y-3">
      <p className="font-semibold text-blue-700">💡 Simulation du prix</p>
      <div className="bg-white rounded-lg p-4 space-y-2 text-sm">
        <div className="flex justify-between text-gray-600">
          <span>Votre prix de base</span>
          <span className="font-semibold">{ownerPrice.toFixed(2)}€</span>
        </div>
        <div className="flex justify-between text-orange-600">
          <span>Commission Nestock (10%)</span>
          <span>+ {nestock.toFixed(2)}€</span>
        </div>
        <div className="flex justify-between text-orange-600">
          <span>Frais Stripe (1.5% + 0.25€)</span>
          <span>+ {stripeFormula}€</span>
        </div>
        <div className="border-t pt-2 flex justify-between font-bold text-blue-700 text-base">
          <span>Prix affiché au locataire</span>
          <span>{totalRenter.toFixed(2)}€/mois</span>
        </div>
        <div className="border-t pt-2 flex justify-between text-green-600 font-semibold">
          <span>Vous recevez</span>
          <span>{ownerPrice.toFixed(2)}€/mois</span>
        </div>
        <div className="flex justify-between text-gray-400 text-xs">
          <span>Nestock perçoit</span>
          <span>{nestockNet}€/mois</span>
        </div>
      </div>
      <p className="text-xs text-gray-500 text-center">
        Le locataire paie le prix TTC. Vous recevez exactement votre prix de base.
      </p>
    </div>
  )
}
