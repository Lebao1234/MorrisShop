import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { MagnifyingGlass } from "@phosphor-icons/react";
import { productApi, categoryApi } from "@/services/api";
import { useFilterParams } from "@/hooks";
import { SEO, SectionHeading, Pagination, EmptyState, ProductGridSkeleton, ErrorState } from "@/components/common";
import { ProductFilters, ProductToolbar, ActiveFilterChips } from "@/components/product/ProductFilters";
import ProductCard from "@/components/product/ProductCard";
import { ButtonCTA } from "@/components/ui/button";
import { Reveal } from "@/components/common/Reveal";

export const ShopPage = () => {
  const { filters, setFilters, clearFilters } = useFilterParams();

  const { data: categories = [] } = useQuery({
    queryKey: ["categories"],
    queryFn: () => categoryApi.list(),
    select: (res) => res.data,
    staleTime: 10 * 60 * 1000,
  });

  const queryParams = {
    page: filters.page || 1,
    limit: 12,
    category: filters.category,
    search: filters.search,
    holdLevel: filters.holdLevel,
    finish: filters.finish,
    hairType: filters.hairType,
    minPrice: filters.minPrice,
    maxPrice: filters.maxPrice,
    inStock: filters.inStock,
    sort: filters.sort || "newest",
  };

  const { data, isLoading, isError, error, refetch, isFetching } = useQuery({
    queryKey: ["products", queryParams],
    queryFn: () => productApi.list(queryParams),
    placeholderData: keepPreviousData,
  });

  const products = data?.data || [];
  const meta = data?.meta;
  const activeCategory = categories.find((c) => c.slug === filters.category);

  const filterPanel = (
    <ProductFilters
      categories={categories}
      filters={filters}
      setFilters={setFilters}
      clearFilters={clearFilters}
    />
  );

  return (
    <>
      <SEO
        title={activeCategory ? activeCategory.name : filters.search ? `Tìm: ${filters.search}` : "Cửa hàng"}
        description={activeCategory?.description}
      />

      {/* Tieu de trang - khong can giua, lech trai theo kieu bien tap */}
      <header className="container pb-14 pt-32 md:pb-16 md:pt-40">
        <Reveal>
          <SectionHeading
            eyebrow={activeCategory ? "Danh mục" : "Cửa hàng"}
            title={
              filters.search
                ? `Kết quả cho “${filters.search}”`
                : activeCategory?.name || "Toàn bộ bộ sưu tập"
            }
            description={
              activeCategory?.description ||
              "Chọn theo độ giữ nếp, kết thúc và loại tóc — bộ lọc bên trái giúp bạn thu hẹp nhanh."
            }
          />
        </Reveal>
      </header>

      <div className="container pb-24 md:pb-30">
        <div className="grid gap-10 lg:grid-cols-[16rem_1fr] lg:gap-14">
          {/* Sidebar loc - chi hien tu lg tro len */}
          <aside className="hidden lg:block">
            <div className="sticky top-28">{filterPanel}</div>
          </aside>

          <div>
            <ProductToolbar
              total={meta?.total}
              filters={filters}
              setFilters={setFilters}
              filterPanel={filterPanel}
              className="border-b border-ink/10 pb-5"
            />

            <ActiveFilterChips
              filters={filters}
              setFilters={setFilters}
              categories={categories}
              className="mt-5"
            />

            <div className="mt-10">
              {isLoading ? (
                <ProductGridSkeleton />
              ) : isError ? (
                <ErrorState message={error?.message} onRetry={refetch} />
              ) : products.length === 0 ? (
                <EmptyState
                  icon={<MagnifyingGlass size={22} weight="light" />}
                  title="Không tìm thấy sản phẩm phù hợp"
                  description="Thử bỏ bớt bộ lọc hoặc tìm với từ khoá khác."
                  action={
                    <ButtonCTA variant="outline" onClick={clearFilters}>
                      Xoá toàn bộ bộ lọc
                    </ButtonCTA>
                  }
                />
              ) : (
                <div
                  className={`grid grid-cols-2 gap-x-5 gap-y-12 transition-opacity duration-400 lg:grid-cols-3 ${
                    isFetching ? "opacity-55" : "opacity-100"
                  }`}
                >
                  {products.map((product, i) => (
                    <ProductCard key={product._id} product={product} index={i} priority={i < 3} />
                  ))}
                </div>
              )}
            </div>

            {meta?.totalPages > 1 && (
              <Pagination
                page={meta.page}
                totalPages={meta.totalPages}
                onChange={(page) => {
                  setFilters({ page }, { resetPage: false });
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
                className="mt-20"
              />
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default ShopPage;
