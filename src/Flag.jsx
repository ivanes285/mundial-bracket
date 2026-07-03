// src/Flag.jsx
export default function Flag({ code, name }) {
  return (
    <img
      className="flag-img"
      src={`https://flagcdn.com/w40/${code}.png`}
      srcSet={`https://flagcdn.com/w80/${code}.png 2x`}
      alt={`Bandera de ${name}`}
      loading="lazy"
      width={24}
      height={18}
    />
  );
}
