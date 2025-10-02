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
    <div className="w-full h-screen overflow-y-auto bg-gray-200">
      <div className="flex flex-col items-center gap-12 py-10">
        {slides.map((slide, index) => (
          <div
            key={index}
            className="relative w-[80%]  h-1/3   bg-gradient-to-r from-gray-600 to-cyan-800  rounded-xl shadow-2xl overflow-hidden flex flex-col text-white p-10"
          >
            {/* Title */}
            <h2 className="text-4xl font-extrabold text-center mb-6">
              {slide.title}
            </h2>

            {/* Image */}
            <div className="flex-1 flex items-center justify-center">
              <img
                src={slide.image}
                alt={slide.title}
                 className="w-[80%] max-h-[40vh] min-h-[30vh] object-contain rounded-lg shadow-lg"
              />
            </div>

            {/* Text */}
            <p className="text-lg text-center mt-6 leading-relaxed">
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
