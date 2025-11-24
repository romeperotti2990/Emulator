import React, { useMemo } from 'react';
import { useAuth } from '../services/AuthContext';

const FavoriteButton = React.memo(({ item, variant = 'card', isFavoritedProp }) => {
    const { favorites, toggleFavorite } = useAuth();

    // Determine if item is favorited
    const isFavorited = isFavoritedProp !== undefined 
        ? isFavoritedProp
        : useMemo(() => {
            const itemUrl = item?.links?.[0]?.url;
            if (!itemUrl) return false;
            return favorites.some(f => f?.links?.[0]?.url === itemUrl);
        }, [favorites, item?.links?.[0]?.url]);

    const handleToggle = (e) => {
        e.stopPropagation();
        toggleFavorite(item);
    };

    // Variant styles
    const styles = {
        card: {
            className: `cursor-pointer absolute top-1 right-1 w-6 h-6 rounded-full z-50 transition-colors flex items-center justify-center leading-none ${isFavorited ? 'bg-yellow-400 hover:bg-yellow-300 text-gray-900' : 'bg-gray-900/70 text-yellow-400 hover:bg-gray-900'}`,
            fontSize: '0.75rem',
        },
        list: {
            className: `w-8 h-8 rounded-full hover:bg-gray-200 dark:hover:bg-gray-800 hover:cursor-pointer flex items-center justify-center ${isFavorited ? 'text-yellow-400' : 'text-gray-400'}`,
            fontSize: '1rem',
        }
    };

    const style = styles[variant];

    return (
        <button
            onClick={handleToggle}
            title={isFavorited ? "Remove from favorites" : "Add to favorites"}
            className={style.className}
            style={{ fontSize: style.fontSize, lineHeight: '1' }}
        >
            <span aria-hidden="true" style={{ marginTop: '-0.05rem' }}>{isFavorited ? '★' : '☆'}</span>
        </button>
    );
}, (prevProps, nextProps) => {
    // Safe comparator: don't crash if links are missing
    return prevProps.isFavoritedProp === nextProps.isFavoritedProp
        && prevProps?.item?.links?.[0]?.url === nextProps?.item?.links?.[0]?.url
        && prevProps.variant === nextProps.variant;
});

FavoriteButton.displayName = 'FavoriteButton';

export default FavoriteButton;
