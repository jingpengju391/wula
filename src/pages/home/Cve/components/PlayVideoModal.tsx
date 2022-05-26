import { useLatest } from "ahooks";
import { Modal } from "antd";
import { FC, useEffect, useState } from "react";
import { VideoJsPlayerOptions } from "video.js";
import VideoPlayer from "../../../../components/VideoPlayer";

type PlayVideoModalProps = {
  isModalVisible: boolean;
  url: string;
  close: () => void;
};

const PlayVideoModal: FC<PlayVideoModalProps> = ({ isModalVisible, url, close }) => {
  // const [videoJsOptions, setVideoJsOptions] = useState<VideoJsPlayerOptions>({
  //   // width: 240,
  //   controls: true,
  //   playbackRates: [0.5, 1, 1.25, 1.5, 2],
  //   responsive: true,
  //   fluid: true,
  // });
  // const latest = useLatest(videoJsOptions);

  // useEffect(() => {
  //   setVideoJsOptions({
  //     // width: 240,
  //     controls: true,
  //     playbackRates: [0.5, 1, 1.25, 1.5, 2],
  //     responsive: true,
  //     fluid: true,
  //     sources: [
  //       {
  //         src: url,
  //         type: "video/mp4",
  //       },
  //     ],
  //   });
  // }, [url]);
  // console.log(videoJsOptions);

  const options = {
    // width: 240,
    controls: true,
    playbackRates: [0.5, 1, 1.25, 1.5, 2],
    responsive: true,
    fluid: true,
    sources: [
      {
        src: url,
        type: "video/mp4",
      },
    ],
  };

  return (
    <Modal bodyStyle={{padding:0}} centered title={null} footer={null} visible={isModalVisible} onCancel={close}>
      <VideoPlayer options={options} onReady={() => {}} />
    </Modal>
  );
};

export default PlayVideoModal;
