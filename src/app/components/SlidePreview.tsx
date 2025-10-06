'use client'

interface Slide {
  id:string
  title: string
  text: string
  image: string
  conversation_id:string
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
            className="relative w-[80%] min-h-[60vh] rounded-2xl shadow-2xl overflow-hidden flex"
          >
            {/* Left side: Image */}
            {slide.image && (
              <div className="w-[40%]   flex items-center justify-center p-4">
                <img
                  src={slide.image}
                  alt={slide.title}
                  className="w-full h-[60%] rounded-lg "
                />
              </div>
            )}

            {/* Right side: Green background with Title and Text */}
            <div className="w-[80%] bg-[#4B5563] flex flex-col justify-center items-center p-8 gap-4 text-white">
              {/* Title */}
              <h2 className="text-3xl font-extrabold text-center drop-shadow-md">
                {slide.title}
              </h2>

              {/* Text */}
              <p className="text-lg text-center leading-relaxed opacity-90">
                {slide.text}
              </p>
            </div>

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
