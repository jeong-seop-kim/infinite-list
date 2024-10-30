"use client";

import Image from "next/image";
import React, { useCallback, useEffect, useState } from "react";
import { FixedSizeList as List } from "react-window";
import { useInView } from "react-intersection-observer";
import { IMAGE_CONST } from "../vars";

interface DataType {
  id: number;
  src: string;
  title: string;
}

const fetchData = async (startIndex = 0): Promise<DataType[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      console.log("DATA_CALLED::");
      const data = Array.from({ length: 20 }, (_, index) => ({
        id: startIndex + index,
        src: `https://picsum.photos/id/${(startIndex + index) % 1000}/200/150`,
        title: `Image ${startIndex + index + 1}`,
      }));
      resolve(data);
    }, 1000);
  });
};

interface IImageItem {
  index: number;
  style: any;
  data: any;
  loadMoreData: () => void;
}

const ImageItem = ({ index, style, data, loadMoreData }: IImageItem) => {
  const image = data[index];
  const isLastItem = index === data.length - 1;

  const { ref: loadMoreRef, inView } = useInView({});

  useEffect(() => {
    if (inView && isLastItem) {
      loadMoreData();
    }
  }, [isLastItem, inView]);

  return (
    <div style={style} ref={loadMoreRef}>
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
  const [data, setData] = useState<DataType[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [hasMore, setHasMore] = useState<boolean>(true);

  console.log(loading, "loading");

  const loadMoreData = useCallback(() => {
    if (loading || !hasMore) return;

    setLoading(true);
    fetchData(data.length).then((newData: DataType[]) => {
      if (newData.length === 0) {
        setHasMore(false);
      } else {
        setData((prevData: DataType[]) => [...prevData, ...newData]); // 기존 데이터 뒤에 새로운 데이터를 추가
      }
      setLoading(false);
    });
  }, [loading, hasMore, data.length]);

  useEffect(() => {
    fetchData().then((result) => {
      setData(result);
      setLoading(false);
    });
  }, []);

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
        itemData={{ data }}
      >
        {({ index, style }) => (
          <ImageItem
            index={index}
            style={style}
            data={data}
            loadMoreData={loadMoreData}
          />
        )}
      </List>
      {loading && <div>Loading</div>}
    </div>
  );
};

export default VirtualizedImageList;
