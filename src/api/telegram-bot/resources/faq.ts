import { env } from '@base/env';

export const TYPE_CONTENT_FAQ = {
  TEXT: 'text',
  IMAGE: 'image',
  TEXT_BOLD: 'text_bold',
  TEXT_ITALIC: 'text_italic',
  LINK: 'link',
};

export const accountFaq = {
  title: 'Quản lý tài khoản',
  questions: [
    {
      title: 'Làm thế nào để đăng ký và sử dụng tài khoản?',
      answers: [
        {
          text: 'Bạn có thể đăng ký tài khoản ANOTRADE bằng cách liên kết địa chỉ ví (non-custodial wallet) chỉ với vài thao tác',
          type: TYPE_CONTENT_FAQ.TEXT_BOLD,
          children: [],
        },
        {
          text: 'Lưu ý: Bạn cần phải thực hiện kết nối các ví với trình duyệt web trước khi liên kết ANOTRADE',
          type: TYPE_CONTENT_FAQ.TEXT,
          children: [
            {
              text: 'Xem thêm tại:',
              type: TYPE_CONTENT_FAQ.TEXT,
              children: [],
            },
            {
              text: 'Metamask',
              type: TYPE_CONTENT_FAQ.TEXT_BOLD,
              children: [],
            },
            {
              text: 'Hướng dẫn kết nối với metamask',
              type: TYPE_CONTENT_FAQ.LINK,
              value: 'https://support.metamask.io/hc/vi/articles/360015489531-B%E1%BA%AFt-%C4%91%E1%BA%A7u-v%E1%BB%9Bi-MetaMask',
              children: [],
            },
            {
              text: 'Trust wallet',
              type: TYPE_CONTENT_FAQ.TEXT_BOLD,
              children: [],
            },
            {
              text: 'Hướng dẫn kết nối với TrustWallet',
              type: TYPE_CONTENT_FAQ.LINK,
              value: 'https://community.trustwallet.com/t/b-t-d-u-s-d-ng-ti-n-ich-trinh-duy-t-trust-wallet/743676',
              children: [],
            },
            {
              text: 'Coinbase',
              type: TYPE_CONTENT_FAQ.TEXT_BOLD,
              children: [],
            },
            {
              text: 'Hướng dẫn kết nối với Coinbase',
              type: TYPE_CONTENT_FAQ.LINK,
              value: 'https://help.coinbase.com/en/wallet/browser-extension/coinbase-wallet-extension',
              children: [],
            },
          ],
        },
        {
          text: '1. Mở trang web/ ứng dụng ANOTRADE và nhấn vào <b>[Liên kết ví]</b>',
          type: TYPE_CONTENT_FAQ.TEXT,
          children: [],
        },
        {
          text: 'Dang ki su dung tai khoan',
          link: 'https://' + env.webDomain.user + '/assets/images/components/desktop/landing/faq/dang-ki-va-su-dung-tai-khoan/mo-trang-web.png',
          type: TYPE_CONTENT_FAQ.IMAGE,
          children: [],
        },
        {
          text: '2. Chọn một ví dùng để liên kết với hệ thống ANOTRADE',
          type: TYPE_CONTENT_FAQ.TEXT,
          children: [],
        },
        {
          text: '',
          link: 'https://' + env.webDomain.user + '/assets/images/components/desktop/landing/faq/dang-ki-va-su-dung-tai-khoan/chon-vi-lien-ket.png',
          type: TYPE_CONTENT_FAQ.IMAGE,
          children: [],
        },
        {
          text: '3. Tùy vào loại ví bạn chọn để liên kết, các phương thức yêu cầu cũng sẽ tùy thuộc vào từng ví (Nhập mật khẩu, quét mã QR…)',
          type: TYPE_CONTENT_FAQ.TEXT,
          children: [
            {
              text: 'Ví metamask',
              type: TYPE_CONTENT_FAQ.TEXT_BOLD,
              children: [],
            },
            {
              text: 'Nhập mật khẩu để liên kết ví',
              type: TYPE_CONTENT_FAQ.TEXT,
              children: [],
            },
            {
              text: '',
              link: 'https://' + env.webDomain.user + '/assets/images/components/desktop/landing/faq/dinh-nghia/unlock-metamask.png',
              type: TYPE_CONTENT_FAQ.IMAGE,
              children: [],
            },
          ],
        },
        {
          text: '4. Sau khi liên kết ví với hệ thống ANOTRADE, bạn sẽ được hỏi và ký xác nhận liên kết ví, vui lòng xem <a href="/terms" target="_blank">Điều khoản sử dụng</a> và <a href="/privacy-principles" target="_blank">Chính sách bảo mật</a> của hệ thống trước khi ký xác nhận',
          type: TYPE_CONTENT_FAQ.TEXT,
          children: [],
        },
        {
          text: 'Chon vi lien ket',
          link: 'https://' + env.webDomain.user + '/assets/images/components/desktop/landing/faq/dinh-nghia/sign-vi-metamask.png',
          type: TYPE_CONTENT_FAQ.IMAGE,
          children: [],
        },
        {
          text: '5. Sau khi ký xác nhận xong, hệ thống ANOTRADE sẽ tự động tạo tài khoản cho bạn dựa vào thông tin địa chỉ ví mà bạn liên kết, bạn không cần phải nhập thêm bất cứ thông tin gì.',
          type: TYPE_CONTENT_FAQ.TEXT,
          children: [],
        },
        {
          text: 'Như vậy là bạn đã tạo thành công tài khoản ANOTRADE. Chúng tôi hi vọng bạn sẽ có trải nghiệm thật tuyệt vời với ANOTRADE !',
          type: TYPE_CONTENT_FAQ.TEXT,
          children: [],
        },
      ],
    },
  ],
};

export const definitionsFaq = {
  title: 'Giới thiệu chung',
  questions: [
    {
      title: 'Giao dịch P2P là gì?',
      answers: [
        {
          text: 'Giao dịch P2P (Ngang hàng) là người dùng mua hoặc bán tiền mã hóa trực tiếp với nhau trên nền tảng, sàn giao dịch hoặc thị trường P2P.',
          type: TYPE_CONTENT_FAQ.TEXT,
          children: [],
        },
        {
          text: 'Nền tảng P2P đóng vai trò là bên hỗ trợ giao dịch thông qua việc cung cấp nền tảng để người bán và người mua đăng quảng cáo mua bán. Đồng thời, nền tảng đảm bảo sự an toàn và bảo mật trong quá trình thực hiện giao dịch.',
          type: TYPE_CONTENT_FAQ.TEXT,
          children: [],
        },
      ],
    },
    {
      title: 'Quảng cáo là gì?',
      answers: [
        {
          text: 'Thương gia có thể đề xuất mức giá mà họ muốn giao dịch tiền mã hoá, và đăng lên nền tảng của chúng tôi. Đề xuất đã được đăng chính là một "Quảng cáo".',
          type: TYPE_CONTENT_FAQ.TEXT,
          children: [],
        },
      ],
    },
    {
      title: 'Những ai được quyền đăng quảng cáo?',
      answers: [
        {
          text: 'Đối với những người dùng đã đáp ứng các điều kiện tiên quyết để trở thành thương gia (Merchant), bạn có thể tạo một quảng cáo mới và đăng quảng cáo bằng cách chọn loại quảng cáo, số lượng giao dịch, giá và các yêu cầu khác… Một khi đã xác nhận những thông tin đó, bạn có thể đăng quảng cáo.',
          type: TYPE_CONTENT_FAQ.TEXT,
          children: [],
        },
      ],
    },
    {
      title: 'Quảng cáo tôi thấy trên hệ thống ANOTRADE có phải do chính ANOTRADE cung cấp không?',
      answers: [
        {
          text: 'Quảng cáo bạn thấy trên hệ thống không phải do ANOTRADE cung cấp. ANOTRADE đóng vai trò là nền tảng hỗ trợ giao dịch, nhưng quảng cáo là do thương gia cung cấp.',
          type: TYPE_CONTENT_FAQ.TEXT,
          children: [],
        },
      ],
    },
    {
      title: 'Thương gia (Merchant) là gì?',
      answers: [
        {
          text: 'Người dùng đăng "quảng cáo", đề xuất mua/bán tiền mã hoá, được xem là thương gia (Merchant).',
          type: TYPE_CONTENT_FAQ.TEXT,
          children: [],
        },
      ],
    },
    {
      title: 'Làm thế nào để tôi thanh toán cho người bán?',
      answers: [
        {
          text: 'Bạn phải làm theo hướng dẫn được cung cấp trên trang chi tiết lệnh và chuyển tiền vào tài khoản của người bán bằng phương thức thanh toán được chỉ định. Sau đó, vui lòng nhấp vào [Đã chuyển, thông báo cho người bán].',
          type: TYPE_CONTENT_FAQ.TEXT,
          children: [],
        },
        {
          text: 'Xin lưu ý rằng số dư tiền pháp định của bạn sẽ không được khấu trừ tự động bằng cách nhấp vào [Đã chuyển, thông báo cho người bán], bạn phải tự mình chuyển tiền.',
          type: TYPE_CONTENT_FAQ.TEXT_ITALIC,
          children: [],
        },
        {
          text: 'Da thong bao cho nguoi ban',
          link: 'https://' + env.webDomain.user + '/assets/images/components/desktop/landing/faq/dinh-nghia/da-chuyen-thong-bao-cho-nguoi-ban.png',
          type: TYPE_CONTENT_FAQ.IMAGE,
          children: [],
        },
      ],
    },
    {
      title: 'Khiếu nại là gì?',
      answers: [
        {
          text: 'Khi xảy ra tranh chấp giữa người bán và người mua và họ muốn ANOTRADE đứng ra phân xử, những người dùng này có thể gửi yêu cầu khiếu nại.',
          type: TYPE_CONTENT_FAQ.TEXT,
          children: [],
        },
      ],
    },
    {
      title: 'Tôi có thể tham gia vào hệ thống ANOTRADE với những vai trò nào?',
      answers: [
        {
          text: 'Hệ thống ANOTRADE là một sàn giao dịch tiền mã hóa, bạn với vai trò là người mua/ người bán sẽ có quyền được tìm kiếm các “Quảng cáo” cần mua/bán và thực hiện giao dịch với người có nhu cầu mua/bán đó.',
          type: TYPE_CONTENT_FAQ.TEXT,
          children: [],
        },
        {
          text: 'Ngoài ra, ANOTRADE còn cho phép người dùng đăng ký sử dụng hệ thống ở vai trò Thương gia (Merchant), là những người có quyền tạo, quản lý các lệnh đăng (post) cần mua/ bán.',
          type: TYPE_CONTENT_FAQ.TEXT,
          children: [],
        },
      ],
    },
    {
      title: 'Làm thế nào để đăng ký tài khoản với vai trò là thương gia?',
      answers: [
        {
          text: 'Vui lòng gửi đơn đăng ký làm thương gia, để biết thêm chi tiết, vui lòng liên hệ bộ phận CSKH.',
          type: TYPE_CONTENT_FAQ.TEXT,
          children: [],
        },
      ],
    },
  ],
};

export const transactionsFaq = {
  title: 'Giao dịch',
  questions: [
    {
      title: 'Làm thế nào để mua tiền mã hóa trên ANOTRADE?',
      answers: [
        {
          text: '1. Nhấn "Mua" và chọn đồng tiền bạn muốn mua (trong ví dụ bên dưới là USDT), chọn một quảng cáo và sau đó nhấn "Mua".',
          type: TYPE_CONTENT_FAQ.TEXT_BOLD,
          children: [],
        },
        {
          text: '',
          link: 'https://' + env.webDomain.user + '/assets/images/components/desktop/landing/faq/giao-dich/mua-va-ban.png',
          type: TYPE_CONTENT_FAQ.IMAGE,
          children: [],
        },
        {
          text: '2. Nhập số tiền (theo tiền fiat) hoặc số lượng tôi sẽ nhận được (theo tiền crypto) mà bạn muốn mua và nhấn "Mua USDT".',
          type: TYPE_CONTENT_FAQ.TEXT_BOLD,
          children: [],
        },
        {
          text: '',
          link: 'https://' + env.webDomain.user + '/assets/images/components/desktop/landing/faq/giao-dich/nhap-so-tien-mua.png',
          type: TYPE_CONTENT_FAQ.IMAGE,
          children: [],
        },
        {
          text: '3. Kiểm tra thông tin giao dịch (số tiền, tỷ giá, số lượng tiền mã hóa) và Phương thức thanh toán trên chi tiết lệnh.',
          type: TYPE_CONTENT_FAQ.TEXT_BOLD,
          children: [],
        },
        {
          text: 'Hoàn tất chuyển khoản giao dịch tiền pháp định trong thời gian thanh toán cho phép. Sau đó nhấn "Đã chuyển, thông báo cho người bán". Hãy nhớ lưu lại hình ảnh bằng chứng chuyển khoản cho người bán để sử dụng cho các trường hợp khiếu nại.',
          type: TYPE_CONTENT_FAQ.TEXT,
          children: [],
        },
        {
          text: '',
          link: 'https://' + env.webDomain.user + '/assets/images/components/desktop/landing/faq/giao-dich/kiem-tra-thong-tin.png',
          type: TYPE_CONTENT_FAQ.IMAGE,
          children: [],
        },
        {
          text: '4. Sau khi nhấn "Đã chuyển, thông báo cho người bán". Vui lòng tick vào "tôi đã hoàn tất chuyển tiền" -> sau đó bấm "xác nhận".',
          type: TYPE_CONTENT_FAQ.TEXT_BOLD,
          children: [],
        },
        {
          text: '',
          link: 'https://' + env.webDomain.user + '/assets/images/components/desktop/landing/faq/giao-dich/xac-nhan-thanh-toan.png',
          type: TYPE_CONTENT_FAQ.IMAGE,
          children: [],
        },
        {
          text: '5. Sau khi xác nhận, hệ thống sẽ tự chuyển thông báo và chờ xác nhận từ phía người bán.',
          type: TYPE_CONTENT_FAQ.TEXT_BOLD,
          children: [],
        },
        {
          text: '',
          link: 'https://' + env.webDomain.user + '/assets/images/components/desktop/landing/faq/giao-dich/cho-lien-he-nguoi-ban.png',
          type: TYPE_CONTENT_FAQ.IMAGE,
          children: [],
        },
        {
          text: 'Lưu ý: Chúng tôi khuyến khích bạn liên hệ trực tiếp với người bán để rút ngắn quá trình giao dịch. Nếu bạn đã thanh toán nhưng không nhận được tiền mã hóa, bạn có thể nhấn "Liên hệ với người bán" , hệ thống sẽ tự động tạo nhóm chat giữa bạn và người bán để tiến hành thỏa thuận.',
          type: TYPE_CONTENT_FAQ.TEXT_ITALIC,
          children: [],
        },
        {
          text: '',
          link: 'https://' + env.webDomain.user + '/assets/images/components/desktop/landing/faq/giao-dich/tham-gia-thoa-thuan.png',
          type: TYPE_CONTENT_FAQ.IMAGE,
          children: [],
        },
        {
          text: 'Tham gia vào nhóm chat và thỏa thuận với người bán',
          type: TYPE_CONTENT_FAQ.TEXT,
          children: [],
        },
        {
          text: '',
          link: 'https://' + env.webDomain.user + '/assets/images/components/desktop/landing/faq/giao-dich/chat-ui.png',
          type: TYPE_CONTENT_FAQ.IMAGE,
          children: [],
        },
      ],
    },
    {
      title: 'Làm thế nào để bán tiền mã hóa trên ANOTRADE?',
      answers: [
        {
          text: '1. Nhấn "Bán" và chọn đồng tiền bạn muốn Bán (trong ví dụ bên dưới là USDT), chọn một quảng cáo và sau đó nhấn "Bán".',
          type: TYPE_CONTENT_FAQ.TEXT_BOLD,
          children: [],
        },
        {
          text: '',
          link: 'https://' + env.webDomain.user + '/assets/images/components/desktop/landing/faq/giao-dich/ban-vndt.png',
          type: TYPE_CONTENT_FAQ.IMAGE,
          children: [],
        },
        {
          text: '2. Nhập số tiền (theo tiền crypto) hoặc số lượng tôi sẽ nhận được (theo tiền fiat) mà bạn muốn bán, sau đó chọn tài khoản nhận tiền và nhấn "Bán USDT".',
          type: TYPE_CONTENT_FAQ.TEXT_BOLD,
          children: [],
        },
        {
          text: '',
          link: 'https://' + env.webDomain.user + '/assets/images/components/desktop/landing/faq/giao-dich/chon-ban-vndt.png',
          type: TYPE_CONTENT_FAQ.IMAGE,
          children: [],
        },
        {
          text: '3. Kiểm tra thông tin giao dịch (số tiền, tỷ giá, số lượng tiền mã hóa) và thông tin tài khoản nhận chuyển tiền của bạn.',
          type: TYPE_CONTENT_FAQ.TEXT_BOLD,
          children: [],
        },
        {
          text: 'Sau đó nhấn "Chuyển USDT đến người mua"',
          type: TYPE_CONTENT_FAQ.TEXT,
          children: [],
        },
        {
          text: '',
          link: 'https://' + env.webDomain.user + '/assets/images/components/desktop/landing/faq/giao-dich/xac-nhan-ban-vndt.png',
          type: TYPE_CONTENT_FAQ.IMAGE,
          children: [],
        },
        {
          text: '4. Sau khi nhấn "Chuyển USDT đến người mua". Hệ thống sẽ tự động tạo giao dịch với tài khoản chuyển tiền mã hóa (crypto) là từ ví của bạn đến ví của người bạn muốn bán. Hãy nhớ lưu lại hình ảnh bằng chứng chuyển crypto cho người mua để sử dụng cho các trường hợp khiếu nại.',
          type: TYPE_CONTENT_FAQ.TEXT_BOLD,
          children: [],
        },
        {
          text: '',
          link: 'https://' + env.webDomain.user + '/assets/images/components/desktop/landing/faq/giao-dich/xac-nhan-gui-tien-ma-hoa.png',
          type: TYPE_CONTENT_FAQ.IMAGE,
          children: [],
        },
        {
          text: '',
          link: 'https://' + env.webDomain.user + '/assets/images/components/desktop/landing/faq/giao-dich/xac-nhan-tren-metamask.png',
          type: TYPE_CONTENT_FAQ.IMAGE,
          children: [],
        },
        {
          text: '5. Sau khi xác nhận, hệ thống kết nối tới ví đang liên kết của bạn và gửi yêu cầu chuyển crypto cho bên Ví xử lý, trong khoản thời gian cho phép, bạn vui lòng thao tác chuyển tiền cho bên mua.',
          type: TYPE_CONTENT_FAQ.TEXT_BOLD,
          children: [],
        },
        {
          text: '',
          link: 'https://' + env.webDomain.user + '/assets/images/components/desktop/landing/faq/giao-dich/gui-tien-ma-hoa.png',
          type: TYPE_CONTENT_FAQ.IMAGE,
          children: [],
        },
        {
          text: '',
          link: 'https://' + env.webDomain.user + '/assets/images/components/desktop/landing/faq/giao-dich/kiem-tra-thong-tin-ban.png',
          type: TYPE_CONTENT_FAQ.IMAGE,
          children: [],
        },
        {
          text: 'Lưu ý: Chúng tôi khuyến khích bạn liên hệ trực tiếp với người mua để rút ngắn quá trình giao dịch. Nếu bạn đã chuyển crypto nhưng không nhận được tiền chuyển khoản lại trong vòng 01 phút sau khi có thông báo chuyển tiền mã hóa thành công từ ví, bạn có thể nhấn "Liên hệ với người mua" , hệ thống sẽ tự động tạo nhóm chat giữa bạn, người mua và bộ phận CSKH của chúng tôi để tiến hành giải quyết.',
          type: TYPE_CONTENT_FAQ.TEXT_ITALIC,
          children: [],
        },
        {
          text: '',
          link: 'https://' + env.webDomain.user + '/assets/images/components/desktop/landing/faq/giao-dich/tham-gia-nhom-telegram-ban.png',
          type: TYPE_CONTENT_FAQ.IMAGE,
          children: [],
        },
      ],
    },
  ],
};

export const adsFaq = {
  title: 'Quảng cáo',
  questions: [
    {
      title: 'Làm thế nào để tôi có thể đăng quảng cáo trên ANOTRADE?',
      answers: [
        {
          text: '1. Đăng nhập vào tài khoản có vai trò là giao dịch viên (Giao dịch viên sẽ là nhân viên dưới quyền quản lý của Thương gia), nhấn vào menu [Giao dịch] -> sau đó chọn [Tạo quảng cáo].',
          type: TYPE_CONTENT_FAQ.TEXT,
          children: [],
        },
        {
          text: '',
          link: 'https://' + env.webDomain.user + '/assets/images/components/desktop/landing/faq/quang-cao/danh-sach-quang-cao.png',
          type: TYPE_CONTENT_FAQ.IMAGE,
          children: [],
        },
        {
          text: '2. Vui lòng lựa chọn loại quảng cáo (Mua/ Bán), loại crypto và loại tiền tệ bạn muốn giao dịch, sau đó bạn chọn/nhập các thông tin về số lượng giao dịch, giá, phương thức thanh toán và các yêu cầu khác. Sau khi đã kiểm tra và xác nhận lại tất cả thông tin, bạn nhấn [đăng tin] để hoàn tất quá trình đăng quảng cáo.',
          type: TYPE_CONTENT_FAQ.TEXT,
          children: [],
        },
        {
          text: '',
          link: 'https://' + env.webDomain.user + '/assets/images/components/desktop/landing/faq/quang-cao/tao-quang-cao.png',
          type: TYPE_CONTENT_FAQ.IMAGE,
          children: [],
        },
      ],
    },
    {
      title: 'Tôi có thể tạm thời ẩn quảng cáo của tôi trên hệ thống được không?',
      answers: [
        {
          text: 'Được, với vai trò là giao dịch viên, bạn có thể truy cập vào mục [Quảng cáo] -> cập nhật tin quảng cáo -> thay đổi trạng thái sang "ngoại tuyến" -> bấm Cập nhật thì quảng cáo của bạn sẽ tạm thời bị ẩn trên hệ thống',
          type: TYPE_CONTENT_FAQ.TEXT_BOLD,
          children: [],
        },
        {
          text: '',
          link: 'https://' + env.webDomain.user + '/assets/images/components/desktop/landing/faq/quang-cao/an-quang-cao.png',
          type: TYPE_CONTENT_FAQ.IMAGE,
          children: [],
        },
      ],
    },
  ],
};

export const appealFaq = {
  title: 'Khiếu nại',
  questions: [
    {
      title: 'Tôi có thể khiếu nại ở đâu?',
      answers: [
        {
          text: 'Trong quá trình giao dịch, nếu bạn có cần bất kì sự hỗ trợ hoặc có vấn đề cần khiếu nại trong lúc giao dịch, vui lòng bấm vào mục [Liên hệ CSKH] tại chính giao dịch mà bạn cần khiếu nại',
          type: TYPE_CONTENT_FAQ.TEXT,
          children: [],
        },
        {
          text: '',
          link: 'https://' + env.webDomain.user + '/assets/images/components/desktop/landing/faq/khieu-nai/lien-he-cskh.png',
          type: TYPE_CONTENT_FAQ.IMAGE,
          children: [],
        },
        {
          text: 'Các khiếu nại giữa người mua và người bán đều được trao đổi và cung cấp thông tin qua nhóm chat, hệ thống sẽ tự động tạo nhóm chat và tổ chức thương lượng, trao đổi hoặc cung cấp các thông tin liên quan đến khiếu nại của người dùng.',
          type: TYPE_CONTENT_FAQ.TEXT,
          children: [],
        },
        {
          text: '',
          link: 'https://' + env.webDomain.user + '/assets/images/components/desktop/landing/faq/khieu-nai/xac-nhan-khieu-nai.png',
          type: TYPE_CONTENT_FAQ.IMAGE,
          children: [],
        },
      ],
    },
    {
      title: 'Làm sao để hủy bỏ khiếu nại?',
      answers: [
        {
          text: 'Sau khi gửi khiếu nại, người dùng đã yêu cầu khiếu nại có thể huỷ khiếu nại nếu đạt được thoả thuận với bên còn lại và không cần bộ phận CSKH đứng ra phân xử nữa.',
          type: TYPE_CONTENT_FAQ.TEXT,
          children: [],
        },
        {
          text: 'Bộ phận CSKH của ANOTRADE sẽ mở lại giao dịch để các bên tiếp tục thực hiện thanh toán hoặc chuyển tiền mã hóa.',
          type: TYPE_CONTENT_FAQ.TEXT,
          children: [],
        },
      ],
    },
  ],
};

export const otherQuestion = {
  title: 'Các câu hỏi khác',
  questions: [
    {
      title: 'Tôi có thể lấy thông tin TxID của giao dịch bằng cách nào?',
      answers: [
        {
          text: '<b>Bước 1:</b> Bấm vào extensions ví Metamask trên trình duyệt',
          type: TYPE_CONTENT_FAQ.TEXT,
          children: [],
        },
        {
          text: '',
          link: 'https://' + env.webDomain.user + '/assets/images/components/desktop/landing/faq/cau-hoi-khac/step-1.png',
          type: TYPE_CONTENT_FAQ.IMAGE,
          children: [],
        },
        {
          text: '<b>Bước 2:</b> Chọn đúng địa chỉ ví đã phát sinh giao dịch',
          type: TYPE_CONTENT_FAQ.TEXT,
          children: [],
        },
        {
          text: '',
          link: 'https://' + env.webDomain.user + '/assets/images/components/desktop/landing/faq/cau-hoi-khac/step-2.png',
          type: TYPE_CONTENT_FAQ.IMAGE,
          children: [],
        },
        {
          text: '<b>Bước 3:</b> Tại tab <b>[Activity]</b>, tìm và bấm vào giao dịch đã phát sinh trên ví',
          type: TYPE_CONTENT_FAQ.TEXT,
          children: [],
        },
        {
          text: '',
          link: 'https://' + env.webDomain.user + '/assets/images/components/desktop/landing/faq/cau-hoi-khac/step-3.png',
          type: TYPE_CONTENT_FAQ.IMAGE,
          children: [],
        },
        {
          text: '<b>Bước 4:</b> Bấm vào "Copy transaction ID" để sao chép TxHash của giao dịch',
          type: TYPE_CONTENT_FAQ.TEXT,
          children: [],
        },
        {
          text: '',
          link: 'https://' + env.webDomain.user + '/assets/images/components/desktop/landing/faq/cau-hoi-khac/step-4.png',
          type: TYPE_CONTENT_FAQ.IMAGE,
          children: [],
        },
        {
          text: '<b>Bước 5:</b> Dán TxHash vào đây và bấm <b>[Xác nhận]</b>. Hệ thống sẽ tự động cập nhật trạng thái giao dịch tương ứng',
          type: TYPE_CONTENT_FAQ.TEXT,
          children: [],
        },
        {
          text: '',
          link: 'https://' + env.webDomain.user + '/assets/images/components/desktop/landing/faq/cau-hoi-khac/step-5.png',
          type: TYPE_CONTENT_FAQ.IMAGE,
          children: [],
        },
      ],
    },
  ],
};
