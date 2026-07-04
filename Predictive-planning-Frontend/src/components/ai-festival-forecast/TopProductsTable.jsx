import { Package } from "lucide-react";
import {
  borderLight,
  card,
  divideLight,
  emptyState,
  iconBox,
  iconColor,
  tableHead,
  tableRowHover,
  textBody,
  textHeading,
  textMuted,
} from "./themeClasses";
import { getUpliftBadgeStyles } from "./utils";

export default function TopProductsTable({ products = [] }) {
  return (
    <div className={card}>
      <div className={`flex items-center gap-3 border-b px-6 py-4 ${borderLight}`}>
        <div className={iconBox.indigo}>
          <Package className={`h-5 w-5 ${iconColor.indigo}`} />
        </div>
        <h2 className={`text-lg font-bold ${textHeading}`}>Top Demand Products</h2>
      </div>

      {!products.length ? (
        <div className={`px-6 py-12 ${emptyState}`}>No product data available.</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead>
              <tr className={tableHead}>
                <th className={`px-6 py-3 text-xs font-semibold uppercase tracking-wide ${textMuted}`}>
                  Product Name
                </th>
                <th className={`px-6 py-3 text-xs font-semibold uppercase tracking-wide ${textMuted}`}>
                  Category
                </th>
                <th className={`px-6 py-3 text-xs font-semibold uppercase tracking-wide ${textMuted}`}>
                  Predicted Uplift
                </th>
                <th className={`px-6 py-3 text-xs font-semibold uppercase tracking-wide ${textMuted}`}>
                  Reasoning
                </th>
              </tr>
            </thead>
            <tbody className={divideLight}>
              {products.map((product) => (
                <tr key={product.product_name} className={tableRowHover}>
                  <td className={`px-6 py-4 font-semibold ${textHeading}`}>
                    {product.product_name}
                  </td>
                  <td className={`px-6 py-4 ${textBody}`}>
                    {product.category || "—"}
                  </td>
                  <td className="px-6 py-4">
                    <span className={getUpliftBadgeStyles()}>
                      {product.predicted_uplift}
                    </span>
                  </td>
                  <td className={`max-w-md px-6 py-4 leading-relaxed ${textBody}`}>
                    {product.reasoning}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
