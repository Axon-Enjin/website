export default function IconDefinitions() {
  return (
    <>
      <svg
        className="svg-library"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <defs>
          <pattern
            id="figure-dots"
            width="6"
            height="6"
            patternUnits="userSpaceOnUse"
          >
            <circle cx="2" cy="2" r=".65" fill="#4c9ed7" opacity=".8" />
          </pattern>
          <pattern
            id="figure-grid"
            width="16"
            height="8"
            patternUnits="userSpaceOnUse"
          >
            <path
              d="M0 0h16M0 0v8"
              fill="none"
              stroke="#3b7eaf"
              strokeWidth=".5"
              opacity=".7"
            />
          </pattern>
          <symbol id="arrow" viewBox="0 0 24 24">
            <path d="M4 12h15m-6-6 6 6-6 6" />
          </symbol>
          <symbol id="diagonal" viewBox="0 0 24 24">
            <path d="M6 18 18 6M6 6h12v12" />
          </symbol>
          <symbol id="box" viewBox="0 0 24 24">
            <path d="m12 3 9 5v9l-9 5-9-5V8Zm0 10v9M3 8l9 5 9-5M7.5 5.5l9 5v4" />
          </symbol>
          <symbol id="people" viewBox="0 0 24 24">
            <circle cx="9" cy="7" r="3" />
            <path d="M3 21v-3a6 6 0 0 1 12 0v3m1-16a3 3 0 0 1 0 6m2 3a5 5 0 0 1 3 4v3" />
          </symbol>
          <symbol id="report" viewBox="0 0 24 24">
            <rect x="4" y="3" width="16" height="18" rx="3" />
            <path d="M8 16v-4m4 4V7m4 9v-6" />
          </symbol>
          <symbol id="grid" viewBox="0 0 24 24">
            <rect x="3" y="3" width="7" height="7" rx="1.5" />
            <rect x="14" y="3" width="7" height="7" rx="1.5" />
            <rect x="3" y="14" width="7" height="7" rx="1.5" />
            <rect x="14" y="14" width="7" height="7" rx="1.5" />
          </symbol>
          <symbol id="check" viewBox="0 0 24 24">
            <path d="m5 12 4 4L19 6" />
          </symbol>
          <symbol id="swap" viewBox="0 0 24 24">
            <path d="M4 7h16m-5-5 5 5-5 5M20 17H4m5-5-5 5 5 5" />
          </symbol>
          <symbol id="pause" viewBox="0 0 24 24">
            <path d="M8 5v14M16 5v14" />
          </symbol>
          <symbol id="play" viewBox="0 0 24 24">
            <path d="m8 4 12 8-12 8Z" />
          </symbol>
        </defs>
      </svg>
    </>
  );
}
