import { useEffect, useState } from "react";

// ---------------- Types ----------------

type Card = {
  id: number;
  emoji: string;
  matched: boolean;
};

// ---------------- Themes ----------------

const THEMES = [
  ["🚀","🪐","🌍","⭐","☄️","🌙","🛰️","👨‍🚀"],
  ["🐶","🐱","🐸","🦊","🐼","🐵","🐰","🦁"],
  ["🍕","🍔","🍟","🌮","🍩","🍓","🍉","🍎"],
  ["⚽","🏀","🎾","🏈","🏐","🥊","⚾","🏓"]
];

// ---------------- Shuffle ----------------

function shuffle<T>(array: T[]) {
  const arr = [...array];

  for (let i = arr.length - 1; i > 0; i--) {

    const j = Math.floor(Math.random() * (i + 1));

    [arr[i], arr[j]] = [arr[j], arr[i]];
  }

  return arr;
}

function createBoard() {

  const theme =
    THEMES[Math.floor(Math.random() * THEMES.length)];

  const cards = [...theme, ...theme];

  return shuffle(cards).map((emoji, index) => ({
    id: index,
    emoji,
    matched: false,
  }));
}

export default function MemoryGame() {

  const [cards, setCards] = useState<Card[]>(createBoard);

  const [flipped, setFlipped] = useState<number[]>([]);

  const [moves, setMoves] = useState(0);

  const [seconds, setSeconds] = useState(0);

  const [running, setRunning] = useState(false);

  // ---------------- Timer ----------------

  useEffect(() => {

    if (!running) return;

    const timer = setInterval(() => {
      setSeconds(prev => prev + 1);
    },1000);

    return () => clearInterval(timer);

  }, [running]);

  // ---------------- Flip ----------------

  function flipCard(index:number){

    if(!running)
      setRunning(true);

    if(flipped.length===2)
      return;

    if(flipped.includes(index))
      return;

    if(cards[index].matched)
      return;

    setFlipped(prev=>[...prev,index]);

  }
    // ---------------- Match Logic ----------------

  useEffect(() => {

    if (flipped.length !== 2) return;

    const [first, second] = flipped;

    setMoves(prev => prev + 1);

    if (cards[first].emoji === cards[second].emoji) {

      setCards(prev =>
        prev.map((card, index) =>
          index === first || index === second
            ? { ...card, matched: true }
            : card
        )
      );

      setFlipped([]);

    } else {

      const timeout = setTimeout(() => {
        setFlipped([]);
      }, 800);

      return () => clearTimeout(timeout);

    }

  }, [flipped]);

  // ---------------- Restart ----------------

  function restartGame() {

    setCards(createBoard());

    setFlipped([]);

    setMoves(0);

    setSeconds(0);

    setRunning(false);

  }

  const completed = cards.length > 0 && cards.every(card => card.matched);

  return (

    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-10">

      <h1 className="text-4xl font-bold text-center">
        Memory Game
      </h1>

      <p className="text-center text-neutral-500 mt-3 mb-10">
        Find every matching pair.
      </p>

      <div className="flex justify-center gap-6 sm:gap-12 mb-8 sm:mb-10">

        <div className="text-center">

          <p className="text-sm text-neutral-400">
            Moves
          </p>

          <p className="text-2xl sm:text-3xl font-bold">
            {moves}
          </p>

        </div>

        <div className="text-center">

          <p className="text-sm text-neutral-400">
            Time
          </p>

          <p className="text-2xl sm:text-3xl font-bold">
            {seconds}s
          </p>

        </div>

      </div>

      <div className="grid grid-cols-4 gap-2 sm:gap-4 max-w-md sm:max-w-xl mx-auto">

        {cards.map((card,index)=>{

          const visible =
  flipped.includes(index) ||
  card.matched;

const matched =
  card.matched;

          return(

            <button
                key={card.id}
                onClick={() => flipCard(index)}
                className="aspect-square w-full max-w-[72px] sm:max-w-[90px] md:max-w-[100px] mx-auto [perspective:1000px]"
              >

                <div
                  className={`
                    relative
                    h-full
                    w-full
                    transition-all
                    duration-500
                    [transform-style:preserve-3d]
                    ${
                      visible
                        ? "[transform:rotateY(180deg)]"
                        : ""
                    }
                    ${
                      matched
                        ? "scale-105"
                        : ""
                    }
                  `}
                >

                  {/* Front */}

                  <div
                    className="
                      absolute
                      inset-0
                      rounded-2xl
                      border
                      border-neutral-200
                      bg-white
                      shadow-sm
                      flex
                      items-center
                      justify-center
                      text-2xl sm:text-3xl md:text-4xl
                      [backface-visibility:hidden]
                    "
                  >
                    ❔
                  </div>

                  {/* Back */}

                  <div
                    className={`
                      absolute
                      inset-0
                      rounded-2xl
                      border
                      shadow-sm
                      flex
                      items-center
                      justify-center
                      text-2xl sm:text-3xl md:text-4xl
                      [transform:rotateY(180deg)]
                      [backface-visibility:hidden]
                      ${
                        matched
                          ? "bg-green-100 border-green-400"
                          : "bg-blue-50 border-neutral-200"
                      }
                    `}
                  >
                    {card.emoji}
                  </div>

                </div>

              </button>


          );

        })}

      </div>

      <div className="flex justify-center mt-10">

        <button

          onClick={restartGame}

          className="
            px-8
            py-3
            rounded-xl
            bg-black
            text-white
            hover:bg-neutral-700
            transition
          "

        >

          Restart

        </button>

      </div>
            {/* Victory Screen */}

      {completed && (

        <div className="mt-12 rounded-3xl border border-green-200 bg-green-50 p-8 text-center">

          <h2 className="text-4xl font-bold mb-4">
            🎉 You Won!
          </h2>

          <p className="text-neutral-600 mb-8">
            Congratulations! You matched every card.
          </p>

          <div className="grid grid-cols-4 gap-3 max-w-lg mx-auto">

            <div>

              <p className="text-sm text-neutral-500">
                Total Moves
              </p>

              <p className="text-2xl sm:text-3xl font-bold">
                {moves}
              </p>

            </div>

            <div>

              <p className="text-sm text-neutral-500">
                Time
              </p>

              <p className="text-2xl sm:text-3xl font-bold">
                {seconds}s
              </p>

            </div>

          </div>

          <button

            onClick={restartGame}

            className="
              px-8
              py-3
              rounded-xl
              bg-green-600
              text-white
              hover:bg-green-700
              transition
            "

          >

            Play Again

          </button>

        </div>

      )}

    </div>

  );

}