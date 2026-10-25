export default function MotionToggle() {
  return (
    <>
      <button
        className="motion-toggle"
        id="motion-toggle"
        type="button"
        aria-pressed="false"
        aria-label="Pause all animation"
      >
        <svg className="icon">
          <use href="#pause" />
        </svg>
        <span>Motion on</span>
      </button>
    </>
  );
}
