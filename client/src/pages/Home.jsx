import { useQuery } from "@tanstack/react-query";
import { bannerApi, productApi } from "@/services/api";
import { SEO, PageLoader } from "@/components/common";
import HeroVideo from "@/components/home/HeroVideo";
import {
  CollectionShowcase,
  ProductCarousel,
  StorySection,
  PillarsSection,
  MarqueeStrip,
  PromoBanner,
} from "@/components/home/Sections";

export const Home = () => {
  const { data: content, isLoading: loadingContent } = useQuery({
    queryKey: ["home-content"],
    queryFn: bannerApi.home,
    select: (res) => res.data,
    staleTime: 5 * 60 * 1000,
  });

  const { data: showcase, isLoading: loadingShowcase } = useQuery({
    queryKey: ["home-showcase"],
    queryFn: productApi.showcase,
    select: (res) => res.data,
    staleTime: 2 * 60 * 1000,
  });

  if (loadingContent && loadingShowcase) return <PageLoader />;

  const hero = content?.hero_video?.[0] || content?.hero_image?.[0];
  const collections = content?.collection_banner || [];
  const story = content?.story?.[0];
  const promo = content?.promo?.[0];

  return (
    <>
      <SEO
        title="Sáp vuốt tóc thủ công cho quý ông"
        description="Kết cấu làm nên phong thái. Bộ sưu tập sáp vuốt tóc, pomade và sản phẩm chăm sóc tóc nam phối chế thủ công tại Hà Nội."
        image={hero?.posterUrl || hero?.mediaUrl}
      />

      <HeroVideo banner={hero} />

      <MarqueeStrip />

      <CollectionShowcase banners={collections} />

      <ProductCarousel
        eyebrow="Được chọn nhiều nhất"
        title="Bán chạy trong tháng"
        description="Những kết cấu được khách hàng quay lại mua nhiều nhất — đã qua kiểm chứng của hàng nghìn mái tóc."
        products={showcase?.bestSellers || []}
      />

      <StorySection banner={story} />

      <PillarsSection />

      <ProductCarousel
        eyebrow="Vừa ra mắt"
        title="Sản phẩm mới"
        description="Những công thức mới nhất vừa hoàn thiện tại xưởng."
        products={showcase?.newArrivals || []}
        viewAllTo="/shop?sort=newest"
      />

      <PromoBanner banner={promo} />
    </>
  );
};

export default Home;
