import React from 'react';
import styled from 'styled-components';

const photos = [
  '/assets/bg1.jpg',
  '/assets/bg2.jpg',
  '/assets/bg3.jpg',
  '/assets/bg4.jpg',
  '/assets/bg5.jpg',
  '/assets/bg6.jpg',
  '/assets/bg7.jpg',
  '/assets/bg8.jpg'
];

const gradients = [
  'linear-gradient(135deg, #dfe9f3 0%, #ffffff 100%)',
  'linear-gradient(135deg, #36d1dc 0%, #5b86e5 100%)',
  'linear-gradient(135deg, #2193b0 0%, #6dd5ed 100%)',
  'linear-gradient(135deg, #cc2b5e 0%, #753a88 100%)',
  'linear-gradient(135deg, #f7971e 0%, #ffd200 100%)'
];

export default function BoardBackgroundPopup({ onClose, onSelectBackground }) {
  return (
    <PopupWrapper>
      <Header>
        <span>Board background</span>
        <CloseButton onClick={onClose}>×</CloseButton>
      </Header>

      <Section>
        <Label>
          Photos <LinkButton type="button">View more</LinkButton>
        </Label>
        <Grid>
          {photos.map((src, idx) => (
            <ImageBox key={idx} onClick={() => onSelectBackground(`url(${src})`)}>
              <img src={src} alt="bg" />
            </ImageBox>
          ))}
        </Grid>
      </Section>

      <Section>
        <Label>
          Colors <LinkButton type="button">View more</LinkButton>
        </Label>
        <Grid>
          {gradients.map((color, idx) => (
            <ColorBox
              key={idx}
              style={{ background: color }}
              onClick={() => onSelectBackground(color)} // Cập nhật background trực tiếp
            />
          ))}
        </Grid>
      </Section>
    </PopupWrapper>
  );
}

const PopupWrapper = styled.div`
  position: absolute;
  top: 0;
  left: 280px;
  width: 300px;
  background: white;
  border-radius: 8px;
  padding: 16px;
  box-shadow: 0 6px 18px rgba(0,0,0,0.15);
  z-index: 1000;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: bold;
  margin-bottom: 12px;
`;

const CloseButton = styled.button`
  background: none;
  border: 1px solid #ccc;
  border-radius: 50%;
  width: 24px;
  height: 24px;
  line-height: 1;
  font-size: 16px;
  cursor: pointer;
`;

const Section = styled.div`
  margin-bottom: 16px;
`;

const Label = styled.div`
  font-weight: 600;
  margin-bottom: 8px;
  font-size: 14px;
  display: flex;
  justify-content: space-between;
  a {
    font-size: 12px;
    text-decoration: underline;
    color: #5b6f8c;
  }
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 6px;
`;

const ImageBox = styled.div`
  width: 100%;
  aspect-ratio: 16/9;
  overflow: hidden;
  border-radius: 4px;
  cursor: pointer;
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

const ColorBox = styled.div`
  width: 100%;
  aspect-ratio: 1/1;
  border-radius: 4px;
  cursor: pointer;
`;

const LinkButton = styled.button`
  background: none;
  border: none;
  padding: 0;
  font-size: 12px;
  text-decoration: underline;
  color: #5b6f8c;
  cursor: pointer;

  &:hover {
    color: #2c3e50;
  }
`;
