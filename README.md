# Forest Dining - Solana Bill Split

A decentralized application for splitting restaurant bills using the Solana blockchain. Built with a forest-themed UI, this application allows restaurant owners to create bills and customers to join and settle their payments seamlessly.

## Features

- **Create Bills**: Restaurant owners can create new bills with a total amount
- **Join Bills**: Customers can join existing bills and specify their share
- **Settle Payments**: Participants can settle their payments directly through Solana
- **Beautiful Forest Theme**: A nature-inspired UI with a calming forest color palette

## Tech Stack

- **Frontend**:
  - Next.js 14
  - TypeScript
  - Tailwind CSS
  - DaisyUI
  - React Hot Toast

- **Blockchain**:
  - Solana
  - Anchor Framework
  - Solana Wallet Adapter

## Getting Started

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/forest-dining.git
   cd forest-dining
   ```

2. Install dependencies:
   ```bash
   # Install frontend dependencies
   cd frontend
   npm install
   ```

3. Set up environment variables:
   Create a `.env.local` file in the frontend directory:
   ```
   NEXT_PUBLIC_SOLANA_RPC_HOST=https://api.devnet.solana.com
   ```

4. Run the development server:
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## Smart Contract

The Solana program is deployed on devnet with the following program ID:
```
5yivUPu1h8DUKsiSw6kYnTZD7u5bny9SeyweBFfRAyfZ
```

### Program Instructions

1. `createBill`: Create a new bill with restaurant details and total amount
2. `addParticipant`: Add a participant to an existing bill with their share amount
3. `settlePayment`: Settle a participant's payment for their share

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Solana Foundation for the blockchain infrastructure
- Project Serum for the Anchor framework
- The amazing Solana developer community 