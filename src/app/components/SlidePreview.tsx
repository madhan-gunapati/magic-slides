'use client'

interface Slide {
  title: string
  text: string
  image: string
}

interface SlidePreviewProps {
  slides: Slide[]
}

const SlidePreview = ({ slides }: SlidePreviewProps) => {
  return (
    <div className="w-full h-screen overflow-y-auto bg-gray-100">
      <div className="flex flex-col items-center gap-12 py-12">
        {slides.map((slide, index) => (
          <div
            key={index}
            className="relative w-[80%] min-h-[60vh] bg-gradient-to-r from-gray-600 to-cyan-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col text-white p-10 transform transition hover:scale-[1.02]"
          >
            {/* Title */}
            <h2 className="text-3xl font-extrabold text-center mb-6 tracking-wide drop-shadow-md">
              {slide.title}
            </h2>

            {/* Image */}
            <div className="flex-1 flex items-center justify-center">
              <img
                src={slide.image}
                alt={slide.title}
                className="w-[80%] max-h-[40vh] object-contain rounded-lg shadow-lg"
              />
            </div>

            {/* Text */}
            <p className="text-lg text-center mt-6 leading-relaxed opacity-90">
              {slide.text}
            </p>

            {/* Page number */}
            <div className="absolute bottom-4 right-6 text-sm text-gray-300">
              {index + 1} / {slides.length}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default SlidePreview
