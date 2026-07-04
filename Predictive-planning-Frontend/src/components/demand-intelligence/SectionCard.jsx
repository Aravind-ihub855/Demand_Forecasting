import {
  borderLight,
  card,
  iconBox,
  iconColor,
  textHeading,
  textMuted,
} from "./themeClasses";

export function SectionCard({
  title,
  subtitle,
  icon: Icon,
  children,
  className = "",
  action,
  iconAccent = "indigo",
}) {
  return (
    <section className={`${card} overflow-hidden ${className}`}>
      <div
        className={`flex flex-wrap items-start justify-between gap-3 border-b  px-6 py-4 ${borderLight}`}
      >
        <div className="flex items-center gap-3">
          {Icon && (
            <div className={`${iconBox[iconAccent] || iconBox.indigo} flex items-center justify-center`}>
              <Icon className={`h-5 w-5 ${iconColor[iconAccent] || iconColor.indigo}`} />
            </div>
          )}
          <div>
            <h2 className={`text-lg font-bold ${textHeading}`}>{title}</h2>
            {subtitle && (
              <p className={`mt-0.5 text-sm ${textMuted}`}>{subtitle}</p>
            )}
          </div>
        </div>
        {action}
      </div>
      <div className="p-6">{children}</div>
    </section>
  );
}
