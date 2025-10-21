//components
import LogoAndAccount from '@/components/layouts/header/LogoAndAccount';
import SearchBar from '@/components/layouts/header/SearchBar';
import SearchResults from '@/components/layouts/header/SearchResults';

export default async function Header() {
    return (
        <header className='relative flex w-full flex-col justify-between bg-customPrimary px-4 pb-4 pt-1 text-customSecondary'>
            <LogoAndAccount />
            <SearchBar />
            <SearchResults />
        </header>
    );
}
