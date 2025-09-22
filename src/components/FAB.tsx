import ReviewModal from './ReviewModal';

const FAB = ({ visible, setVisible }: ReviewModal) => {
  return (
    <div
      className="fixed z-30 bottom-1 right-1 hover:cursor-pointer hover:animate-spin mr-1 mb-1"
      onClick={() => {
        setVisible(true);
      }}
    >
      <svg
        version="1.0"
        xmlns="http://www.w3.org/2000/svg"
        width="3rem"
        height="3rem"
        viewBox="0 0 512 512"
        preserveAspectRatio="xMidYMid meet"
      >
        <circle cx="256" cy="256" r="256" fill="currentColor" />
        <g
          fill="gold"
          stroke="none"
          transform="translate(128, 384) scale(0.05, -0.05)"
        >
          <path
            d="M2465 5008 c-80 -15 -171 -64 -236 -128 -57 -56 -69 -78 -324 -595
            -146 -296 -274 -550 -285 -565 -11 -15 -35 -35 -54 -44 -20 -9 -269 -50 -621
            -101 -369 -54 -607 -93 -640 -106 -281 -105 -391 -450 -224 -702 16 -25 220
            -231 452 -457 232 -225 429 -420 436 -433 34 -54 32 -74 -70 -671 -86 -496
            -100 -593 -96 -661 10 -191 134 -354 317 -417 89 -31 221 -30 302 1 32 12 284
            141 560 287 277 145 520 269 541 276 27 8 47 8 75 0 20 -6 264 -131 542 -277
            278 -146 530 -275 560 -287 79 -30 212 -31 300 0 130 45 242 152 290 279 45
            117 42 157 -69 799 -102 597 -104 617 -70 671 7 13 203 207 436 433 232 226
            435 431 452 457 168 253 58 597 -226 703 -35 13 -260 50 -640 105 -350 51
            -599 92 -620 101 -18 9 -42 29 -53 44 -11 15 -139 269 -285 564 -250 507 -268
            541 -322 595 -112 112 -269 159 -428 129z"
          />
        </g>
      </svg>
      {visible && <ReviewModal visible={visible} setVisible={setVisible} />}
    </div>
  );
};

export default FAB;
