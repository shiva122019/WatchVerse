import SwipeCard from "./SwipeCard";

export default function SwipeStack({ cards, currentIndex, onSwipe }) {
  if (!cards.length || currentIndex >= cards.length) {
    return <div className="text-center text-gray-400">No more content.</div>;
  }

  const currentCard = cards[currentIndex];
  const nextCard = cards[currentIndex + 1];

  function handleSwipe(direction) {
    onSwipe(direction, currentCard);
  }

  return (
    <div className="relative w-[360px] h-[580px]">
      {nextCard && (
        <div className="absolute inset-0 scale-95 opacity-60">
          <img
            src={`https://image.tmdb.org/t/p/w500${nextCard.poster}`}
            alt={nextCard.title}
            className="w-full h-full rounded-3xl object-cover"
          />
        </div>
      )}

      <SwipeCard
        key={`${currentCard.mediaType}-${currentCard.id}`}
        card={currentCard}
        onSwipe={handleSwipe}
      />
    </div>
  );
}
