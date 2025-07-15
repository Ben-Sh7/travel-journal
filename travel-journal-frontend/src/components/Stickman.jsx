import React from 'react';

const stickmanStyle = {
  width: '120px',
  height: '240px',
  position: 'relative',
  margin: '0 16px',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'flex-start',
  border: '4px solid #e22',
  background: 'linear-gradient(135deg, #fff 60%, #ffe5e5 100%)',
  borderRadius: '18px',
  boxShadow: '0 4px 16px rgba(226,34,34,0.12)',
  animation: 'stickman-walk-x 2s linear infinite',
};
const headStyle = {
  width: '60px',
  height: '60px',
  background: 'black',
  borderRadius: '50%',
  margin: 'auto',
};
const bodyStyle = {
  width: '6px',
  height: '120px',
  background: 'black',
  margin: 'auto',
  animation: 'walk-body-rotate 0.5s alternate infinite',
};
const legsStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  width: '60px',
  margin: 'auto',
  marginTop: '18px',
};
const legStyle = (delay = '0s', reverse = false) => ({
  width: '6px',
  height: '90px',
  background: 'black',
  animation: reverse
    ? 'leg-move-reverse 0.5s alternate infinite'
    : 'leg-move 0.5s alternate infinite',
  animationDelay: delay,
});

export default function Stickman() {
  React.useEffect(() => {
    if (!document.getElementById('stickman-keyframes')) {
      const style = document.createElement('style');
      style.id = 'stickman-keyframes';
      style.innerHTML = `
        @keyframes leg-move {
          0% { transform: rotate(30deg); }
          50% { transform: rotate(-30deg); }
          100% { transform: rotate(30deg); }
        }
        @keyframes leg-move-reverse {
          0% { transform: rotate(-30deg); }
          50% { transform: rotate(30deg); }
          100% { transform: rotate(-30deg); }
        }
        @keyframes walk-body-rotate {
          0% { transform: rotate(-10deg); }
          50% { transform: rotate(10deg); }
          100% { transform: rotate(-10deg); }
        }
        @keyframes stickman-walk-x {
          0% { transform: translateX(0px); }
          25% { transform: translateX(30px); }
          50% { transform: translateX(0px); }
          75% { transform: translateX(-30px); }
          100% { transform: translateX(0px); }
        }
      `;
      document.head.appendChild(style);
    }
  }, []);
  return (
    <div style={{...stickmanStyle, animation: 'stickman-walk-x 2s linear infinite'}}>
      <div style={headStyle}></div>
      <div style={bodyStyle}></div>
      <div style={legsStyle}>
        <div style={legStyle('0s', false)}></div>
        <div style={legStyle('0.25s', true)}></div>
      </div>
    </div>
  );
}
