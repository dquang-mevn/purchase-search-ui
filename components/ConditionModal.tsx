import React from 'react';

export interface ConditionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ConditionModal: React.FC<ConditionModalProps> = ({ isOpen, onClose }) => {
  // If the modal isn't open, don't render anything
  if (!isOpen) {
    return null;
  }

  // Use a class or style to show the modal (e.g., 'modal_area is-open')
  // For this example, we'll just use the existing 'modal_area' class.
  // The `onClose` prop is attached to the overlay and close button.

  return (
    <div id="md_1" className="modal_area">
      <div
        className="modal_overlay"
        title="ボックス外のエリアまたは×ボタンをクリックすると閉じます"
        onClick={onClose}
      >
        &nbsp;
      </div>
      <div className="modal_content_block">
        <span className="square_close_btn hover" onClick={onClose}></span>
        <div className="inner">
          <div className="title_block">
            <p className="title">商品状態の表記について</p>
          </div>
          <ul className="item_block">
            <li className="item">
              <div className="label_tip_block">
                <label className="label_tip label_tip_product">中古品</label>
              </div>
              <p className="text">発売から3～5年経過し一般的に使われてきた中古品で、まだ使用できる</p>
            </li>
            <li className="item">
              <div className="label_tip_block">
                <label className="label_tip label_tip_product">新品</label>
              </div>
              <p className="text">一度も使用しておらず店頭販売時の状態に等しく、開封もしておらず外箱も綺麗に保たれている</p>
            </li>
            <li className="item">
              <div className="label_tip_block">
                <label className="label_tip label_tip_product">未使用品</label>
              </div>
              <p className="text">箱を開けて中身を確認したが、使用していない状態。外箱・付属品すべて綺麗な状態で揃っている</p>
            </li>
            <li className="item">
              <div className="label_tip_block">
                <label className="label_tip label_tip_product">美品</label>
              </div>
              <p className="text">数回使用したのみで綺麗な状態</p>
            </li>
            <li className="item">
              <div className="label_tip_block">
                <label className="label_tip label_tip_product">ジャンク品</label>
              </div>
              <p className="text">激しい破損やキズ、動作しないといった使用目的を果たせない状態</p>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ConditionModal;
