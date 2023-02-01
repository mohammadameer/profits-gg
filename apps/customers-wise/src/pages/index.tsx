const features = [
  {
    title: "🚨 اكتشف المشاكل قبل ما تكبر",
    description: `
      اكتشف المشاكل في فروعك واللي تواجه عملائك قبل ما تكبر، واكسب ثقة عملائك
    `,
  },
  {
    title: "🫂 ابني علاقة ثقة وولاء",
    description: `
      تواصل مع عملائك واجعلهم يشاركون في تطوير الخدمات والمنتجات اللي تقدمها
    `,
  },
  {
    title: "📈 زيادة العملاء والإحتفاظ بهم",
    description: `
      حسن ظهورك في النتائج اللي يبحث عنها عملائك، زود عدد عملائك وارتقي بتجربتهم معك 
    `,
  },
  ,
  {
    title: "🌟 زيادة المراجعات والتقييمات الإيجابية",
    description: `
      زود عدد المراجعات والتقييمات الإيجابية لفروعك، عشان تكسب عملاء جدد 
    `,
  },
];

export default function Home() {
  return (
    <div className="flex w-full grow flex-col items-center">
      <div className="relative flex h-screen w-full grow flex-col items-center justify-center gap-8">
        <h1 className="text text-right text-5xl font-bold leading-snug md:text-center lg:mb-10 lg:text-8xl">
          نجاح شركتك يعتمد على أراء عملائك 🗣️
        </h1>
        <p className="text-xl text-white/80">
          إبني شركة متمحورة حول العميل، زد ثقته فيك وحسن نسب الإحتفاظ، النمو و
          الأرباح
        </p>

        <div className="absolute bottom-10 left-0 flex w-full items-center justify-center">
          <a
            className="cursor-pointer text-2xl transition-all hover:scale-105 active:scale-95"
            href="#features"
          >
            👇
          </a>
        </div>
      </div>
      <div
        id="features"
        className="grid min-h-[90vh] w-full grid-cols-12 gap-6 pb-10 md:gap-8"
      >
        {features.map((feature) => (
          <div
            key={feature?.title}
            className="col-span-full flex cursor-pointer flex-col gap-12 rounded-lg bg-gray-800 p-4 pt-12 transition-all hover:scale-105 active:scale-95 md:col-span-6"
          >
            <p className="text-4xl">{feature?.title}</p>
            <p className="p-6 text-3xl">{feature?.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
