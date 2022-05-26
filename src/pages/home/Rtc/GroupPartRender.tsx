import { Row, Col } from "antd";
import { RemoteParticipant } from "livekit-client";
import { GroupParticipantRender } from "./GroupParticipantRender";

const GroupPartRender = ({ parts,isVideo }: { parts: RemoteParticipant[],isVideo:boolean }) => {
  
    const spanCount = isVideo ? parts.length > 2 ? 8 : 12 : 4
  
    return (
      <div className={isVideo?"group_video_renderers":"group_voice_renderers"}>
         <Row gutter={!isVideo?[8,8]:undefined}>
           {parts?.map((remote, idx) => (
            <Col key={idx} span={spanCount}>
              <GroupParticipantRender isVideo={isVideo} participant={remote} />
            </Col>
          ))}
        </Row>
      </div>
    );
  };

  export default GroupPartRender