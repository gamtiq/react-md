import React, { FC } from "react";
import Head from "next/head";
import { useRouter } from "next/router";

import home from "./home.png";

interface PageMetaProps {
  title?: string;
  description?: string;
  image?: {
    src: string;
    alt: string;
  };
}

type DefaultProps = Required<Pick<PageMetaProps, "description" | "image">>;
type WithDefaultProps = PageMetaProps & DefaultProps;

const PageMeta: FC<PageMetaProps> = props => {
  const { title, description, image } = props as WithDefaultProps;
  const router = useRouter();

  return (
    <Head>
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta
        property="og:url"
        content={`https://react-md.dev${router.pathname}`}
      />
      <meta property="og:image" content={image.src} />
      <meta property="og:image:alt" />
      <meta property="og:type" content="website" />
      <meta property="twitter:site" content="react-md" />
      <meta property="twitter:creator" content="Mikkel Laursen" />
      <meta property="twitter:title" content={title} />
      <meta property="twitter:image" content={image.src} />
    </Head>
  );
};

PageMeta.defaultProps = {
  title: "react-md - Accessible React Material Design Components",
  description:
    "Create fully accessible React components using the material design specifications.",
  image: {
    src: home,
    alt:
      "The landing page for react-md. It describes the purpose of the library and what it tries to accomplish",
  },
};

export default PageMeta;
