"use client";

import Image from "next/image";
import React, { useCallback, useEffect, useState } from "react";
import { FixedSizeList as List } from "react-window";
import { useInView } from "react-intersection-observer";
import { IMAGE_CONST } from "./vars";

// 데이터를 받아오는 비동기 함수 (무한 스크롤로 데이터를 추가로 가져옴)
const fetchData = async (startIndex = 0) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      console.log("DATA_CALLED::");
      const data = Array.from({ length: 20 }, (_, index) => ({
        id: startIndex + index,
        src: `https://picsum.photos/id/${(startIndex + index) % 100}/200/150`,
        title: `Image ${startIndex + index + 1}`,
      }));
      resolve(data);
    }, 1000); // 데이터 생성 지연 시간 (1초)
  });
};

// 각 이미지 항목을 렌더링하는 컴포넌트
const ImageItem = ({ index, style, data, loadMoreRef }) => {
  const image = data[index];
  const isLastItem = index === data.length - 1;

  return (
    <div style={style} ref={isLastItem ? loadMoreRef : undefined}>
      <Image
        src={image.src}
        alt={image.title}
        width={200}
        height={150}
        layout="fixed"
        placeholder="blur"
        blurDataURL={IMAGE_CONST}
      />
      <p>{image.title}</p>
    </div>
  );
};

const VirtualizedImageList = () => {
  const [data, setData] = useState<any>([]);
  const [loading, setLoading] = useState<any>(true);
  const [hasMore, setHasMore] = useState<any>(true);

  useEffect(() => {
    // 초기 데이터 로딩
    fetchData().then((result) => {
      setData(result);
      setLoading(false);
    });
  }, []);

  // 무한 스크롤을 통해 추가 데이터를 불러오는 함수
  const loadMoreData = useCallback(() => {
    if (loading || !hasMore) return;

    setLoading(true);
    fetchData(data.length).then((newData: any) => {
      if (newData.length === 0) {
        setHasMore(false);
      } else {
        setData((prevData: any) => [...prevData, ...newData]);
      }
      setLoading(false);
    });
  }, [loading, hasMore, data.length]);

  // Intersection Observer로 마지막 아이템이 보일 때 추가 데이터를 가져오기
  const { ref: loadMoreRef } = useInView({
    onChange: (inView) => {
      if (inView) loadMoreData();
    },
    rootMargin: "100px",
  });

  if (loading && data.length === 0) {
    return <div>Loading initial data...</div>;
  }

  return (
    <div>
      <List
        height={600}
        itemCount={data.length}
        itemSize={200}
        width={400}
        itemData={{ data, loadMoreRef }}
      >
        {({ index, style, data }) => (
          <ImageItem
            index={index}
            style={style}
            data={data.data}
            loadMoreRef={data.loadMoreRef}
          />
        )}
      </List>
    </div>
  );
};

export default function Home() {
  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <VirtualizedImageList />
    </div>
  );
}
