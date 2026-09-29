import re

file_path = "frontend/src/components/HomeClient.tsx"
with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

replacement = """      {/* Bento Grid Categories Section */}
      <section className="mb-24 px-5 sm:px-8 lg:px-12 max-w-[1400px] mx-auto scroll-mt-24" id="collections">
        <h2 className="text-3xl md:text-4xl font-extrabold mb-10 tracking-tight text-left uppercase">Shop by Categories</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
          
          {/* Top Left - Men */}
          <div className="relative rounded-[12px] overflow-hidden bg-[#e5e5e5] group h-[400px] md:h-[450px]">
            <img src="https://framerusercontent.com/images/9q82g77mrfSql5xHEzQZtflbLwM.png" alt="Men" className="absolute inset-0 w-full h-full object-cover object-center transition-transform duration-700 group-hover:scale-105" />
            <div className="absolute inset-0 bg-black/5 transition-opacity duration-300 group-hover:bg-black/10" />
            
            <div className="absolute inset-0 p-8 md:p-10 flex flex-col justify-between z-10">
              <div>
                <p className="text-gray-500 font-medium text-sm tracking-tight mb-2">FOR MEN</p>
                <h3 className="text-[32px] md:text-[36px] font-bold text-[#080a10] max-w-[280px] leading-[1.1em] tracking-[-0.03em]">Built For Daily Confidence</h3>
              </div>
              <div>
                <Link href="/products?category=men" className="inline-block bg-[#080a10] text-white font-medium px-[18px] py-[10px] text-[16px] rounded-full hover:bg-black transition-colors shadow-sm">
                  Shop Now
                </Link>
              </div>
            </div>
          </div>

          {/* Top Right - Women */}
          <div className="relative rounded-[12px] overflow-hidden bg-[#e5e5e5] group h-[400px] md:h-[450px]">
            <img src="https://framerusercontent.com/images/n0tMygktpfAXrgdpTtmqc1YM.png" alt="Women" className="absolute inset-0 w-full h-full object-cover object-[50%_20%] transition-transform duration-700 group-hover:scale-105" />
            <div className="absolute inset-0 bg-black/5 transition-opacity duration-300 group-hover:bg-black/10" />
            
            <div className="absolute inset-0 p-8 md:p-10 flex flex-col justify-between z-10">
              <div>
                <p className="text-gray-500 font-medium text-sm tracking-tight mb-2">FOR WOMEN</p>
                <h3 className="text-[32px] md:text-[36px] font-bold text-[#080a10] max-w-[280px] leading-[1.1em] tracking-[-0.03em]">Designed For Modern Living</h3>
              </div>
              <div>
                <Link href="/products?category=women" className="inline-block bg-[#080a10] text-white font-medium px-[18px] py-[10px] text-[16px] rounded-full hover:bg-black transition-colors shadow-sm">
                  Shop Now
                </Link>
              </div>
            </div>
          </div>

          {/* Bottom Left - Accessories */}
          <div className="relative rounded-[12px] overflow-hidden bg-[#e5e5e5] group h-[400px] md:h-[450px]">
            <img src="https://images.unsplash.com/photo-1572688484432-280f9bb4318c?auto=format&fit=crop&w=800&q=80" alt="Accessories" className="absolute inset-0 w-full h-full object-cover object-center transition-transform duration-700 group-hover:scale-105" />
            <div className="absolute inset-0 bg-black/5 transition-opacity duration-300 group-hover:bg-black/10" />
            
            <div className="absolute inset-0 p-8 md:p-10 flex flex-col justify-between z-10">
              <div>
                <p className="text-gray-800 font-medium text-sm tracking-tight mb-2">FOR ACCESSORIES</p>
                <h3 className="text-[32px] md:text-[36px] font-bold text-[#080a10] max-w-[280px] leading-[1.1em] tracking-[-0.03em]">The Perfect Finishing Touch</h3>
              </div>
              <div>
                <Link href="/products?category=accessories" className="inline-block bg-[#080a10] text-white font-medium px-[18px] py-[10px] text-[16px] rounded-full hover:bg-black transition-colors shadow-sm">
                  Shop Now
                </Link>
              </div>
            </div>
          </div>

          {/* Bottom Right - Footwear */}
          <div className="relative rounded-[12px] overflow-hidden bg-[#e5e5e5] group h-[400px] md:h-[450px]">
            <img src="https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=800&q=80" alt="Footwear" className="absolute inset-0 w-full h-full object-cover object-center transition-transform duration-700 group-hover:scale-105" />
            <div className="absolute inset-0 bg-black/5 transition-opacity duration-300 group-hover:bg-black/10" />
            
            <div className="absolute inset-0 p-8 md:p-10 flex flex-col justify-between z-10">
              <div>
                <p className="text-gray-800 font-medium text-sm tracking-tight mb-2">FOR FOOTWEAR</p>
                <h3 className="text-[32px] md:text-[36px] font-bold text-[#080a10] max-w-[280px] leading-[1.1em] tracking-[-0.03em]">Step Up Your Game</h3>
              </div>
              <div>
                <Link href="/products?category=footwear" className="inline-block bg-[#080a10] text-white font-medium px-[18px] py-[10px] text-[16px] rounded-full hover:bg-black transition-colors shadow-sm">
                  Shop Now
                </Link>
              </div>
            </div>
          </div>

        </div>
      </section>"""

pattern = r'      \{\/\* Bento Grid Categories Section \*\/\}[\s\S]*?<\/section>'
content = re.sub(pattern, replacement, content)

with open(file_path, "w", encoding="utf-8") as f:
    f.write(content)

